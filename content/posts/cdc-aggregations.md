+++
date = 2025-09-01T18:47:32+02:00
title = "Thoughts on Change Data Capture and aggregations"
description = "TODO"
authors = []
tags = []
categories = [""]
externalLink = ""
draft = true
+++

GENERAL NOTES

- Add images
- Add more code!
- Consider breaking up into diff posts?

---

Let's start by considering a few cases:

- **Banking app**. In order to show the user their current balance, you add up all their bank movements since they opened the account.
- **CMS**. In order to display a word count at the top of an article, you parse the entire contents and sum up each word.
- **Project management**. In order to display the completion percentage of a project, you iterate through all the tasks, checking their status and finally calculating the ratio.
- **Accounting software**. In order to show a business how much they owe a certain customer, you add up all invoices and payments for that customer.
- **E-commerce**. In order to calculate product ratings, you sum up all the purchaser's ratings and divide by number of purchasers.

They're all obvious. And they work. But do they scale? The answer is yes, until they don't.

> Caveat; they might, but more complex queries might not! (eg reports)

At some point you will hit some limits and you will wish you could have a pre-calculated response to those queries that only needs to do incremental updates when something changes, instead of re-calculating from scratch.

So, instead of doing

```sql
SELECT SUM(total)
FROM transactions
WHERE customer_id = ?
	AND ...
```

You might want to do

```sql
SELECT balance
FROM balances
WHERE customer_id = ?
```

Depending on your scale, your architecture, and the number of Certified AWS Cloud Developers on your team, you will choose a different path to get there.

For a surprising amount of cases, you can just materialise these views. Using something like database triggers or similar mechanisms, you can make it so every time a certain table is updated, another one follows.

On the other end of the spectrum, we have the move to a full [event source architecture](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/event-sourcing.html). {{< sidenote "This also works," >}}
<a target="_blank" class="external-link" href="https://medium.com/revolut/event-streaming-the-revolut-way-9d928005ddf7">Some engineers at Revolut have blogged</a> about how they implemented their version, if you want something more hands-on.
{{< /sidenote >}}but it is a massive re-design and it doesn't come without its own issues.

But we can also find a position in the middle: get *some* of the benefits of event sourcing without all the design constraints.

The pattern I am talking about is called Change Data Capture (CDC). The name is fairly self-explanatory: you want to capture all the changes made to the data. In practice, this usually means having some mechanism in place to deliver events when SQL INSERT/UPDATE/DELETE operations happen.

Once we have that in place, we can easily implement a consumer for these events that will build the materialised view elsewhere.

## Building a demo

Implementing, extending, and maintaining systems that follow that pattern is a lot of what I do in my day to day as a {{< abbrev "Site Reliability Engineer" "SRE" >}}.

However, most of the architecture was built before I joined the company, so I wanted to make sure I understood the design decisions. The easiest way to do this, I thought, was re-building it. I also wanted to try out a couple of different technologies, so this seemed like the perfect storm.

You can find all the code I am going to discuss in the [GitHub repo](https://github.com/guille/aggregations-pattern).

Since it's 2025, I started by asking ChatGPT to put something together. I wanted a Python FastAPI back-end serving htmx with Tailwind for the front-end. If nothing else, it put together a better UI on its first attempt than I could have if I had spent a month trying. Then again, I am more likely to become fluent in Kazakh than output a decently-looking web UI if left unsupervised.

The first version had a SQLite DB with two tables. An async thread would run every second to dump everything from table 1 to table 2, and it would then notify another thread that had was sending events via SSE (link) to the frontend with the replicated data.

I ended up throwing most of it out, but it was a surprisingly solid starting point.

### Let's replicate data

Since I already had SQLite, thought of staying small. Unfortunately the replication options out of the box ([1](https://sqlite.org/c3ref/update_hook.html), [2](https://docs.python.org/3/library/sqlite3.html#sqlite3.Connection.set_trace_callback), [3](https://sqlite.org/sessionintro.html)) are all meant to only replicate things ran from the same connection/session. I wanted to have the webapp making changes but be completely independant from the replicating mechanism.

SQLite does have a {{< abbrev "Write-Ahead Log" "WAL" >}} mode, and for a bit I even considered writing my own parser in Go and... I quickly realised that was turning into its {{< sidenote "own side project." >}}
I did use my three free Claude Opus runs to try to oneshot a WAL parser. Sadly it wasn't even close to working.
{{< /sidenote >}}
Maybe one day. Someone [already did it in C++](https://github.com/ranlor/WAL-parser-sqlite) and it seems usable, but at this point I realised it was time to bring out the whole overengineering toolbox.

Since I wasn't going to keep it small, I figured I would use the opportunity to play with different toys than I get at work. I miss working with PostgreSQL, so that was the first thing in the Docker Compose file. For simplicity, I will also use Postgres as the target database, although of course there is no reason why that needs to be the case.

For MySQL, [Maxwell's demon](https://maxwells-daemon.io/) can be used to parse the database's binlog and stream JSON data change events. But what about Postgres? I turned to the excellent *[Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/)* by Martin Kleppmann:

> Bottled Water implements CDC for PostgreSQL using an API that decodes the write-ahead log, Maxwell and Debezium do something similar for MySQL by parsing the binlog

Unfortunately, {{< sidenote "Bottled Water" >}}
It turns out Martin also wrote Bottled Water. Interestingly, he wrote a <a target="_blank" class="external-link"  href="https://www.confluent.io/blog/bottled-water-real-time-integration-of-postgresql-and-kafka/">blog post announcing it</a> that is a near-perfect introduction to the pattern we're addressing here
{{< /sidenote >}}
is no longer maintained, but their README points out that Debezium now also supports CDC in Postgres. So Debezium it is.

Next up we need a place to push the CDC events to. The default choice here would be Apache Kafka, but I wanted to try something else. Thankfully:

> Another way to deploy Debezium is by using the Debezium server. The Debezium server is a configurable, ready-to-use application that streams change events from a source database to a variety of messaging infrastructures.

I decided to use Kafka's less-well-known cousin, [Apache Pulsar](https://pulsar.apache.org/), as my sink of choice.

Configuring it all to work together[^1] in Docker Compose was relatively simple, partly thanks to the example images provided by Debezium.

[^1]: Those with more experience using these technologies will surely find sub-optimal configuration in my examples. By “work together” I really mean “nothing exploded”, and definitely not “perfectly fine-tuned”.


### Business logic

Now that we have ticked all our boxes re infrastructure, it's time to actually write some code.

Our simple app will have a source database with a single table:

```sql
-- source DB
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    total NUMERIC(20,2) NOT NULL
);
```

Our target database will serve a pre-calculated aggregate total and will have two tables. The first one is fairly obvious:

```sql
-- target DB
CREATE TABLE aggregates (
    total NUMERIC(20,2) NOT NULL
);
-- This table will only have one row
INSERT INTO aggregates (total) VALUES (0);
```

In a more realistic example, we might have at least a `business_id` column in the aggregates, maybe even a `customer_id`, depending on the aggregation scope we need. But for our demo purposes, we are aggregating everything.

The second table might not be as obvious if you haven't encountered this pattern before:

```sql
-- target DB
CREATE TABLE cdc_entries (
    invoice_id SERIAL PRIMARY KEY,
    total NUMERIC(20,2) NOT NULL,
    lsn BIGINT NOT NULL
);
```

The `cdc_entries` table contains a mix of source data and event data. An {{< abbrev "Log Sequence Number" "LSN" >}} is a pointer to a location in the WAL (the source database's). It is a comfortable way to have ordering in our target database, so we can interpret events correctly. Another implementation could use the timestamp of the source DB's transaction.

This auxiliary table may not be necessary depending on the guarantee of the messaging infrastructure. If you are assured that a message will be delivered exactly once, in strict monotonic order, and there are no concurrency concerns, you can get away without it. For everyone else, you will need it. I will explain later on exactly why.

### Auxiliary table?

The replication of CDC falls under what is called “eventual consistency”. This means we expect a delay between when a change happens in the source database and when it is fully reflected in the target store. In most applications of this pattern, we're aiming at sub-1 second times. If I make a payment with my credit card and I open my bank app right after, I expect my balance to be updated to reflect it.

This means we need to give up on certain conveniences in order to acquire better performance. As I hinted at before, this pattern gets much easier to use if you have a single consumer of events, guaranteed to get them all exactly once in the same order as they originally happened. However, it is a safe assumption that anyone implementing this pattern cannot afford to have the low latency this would result in.

The solution is usually a combination of multiple consumers running in parallel, at-least-once delivery and no ordering guarantees.

This is where we understand the value of the `cdc_entries` table. Let's say you get two events. The first event results from **c**reating an invoice with total `10`. The second is from **u**pdating its total to `25`, and the third is for **d**eleting the same invoice. Assuming update events give you the old and the new values, you could process these events like this:

```sql
-- create
UPDATE aggregates SET total = total + 10;
-- update
UPDATE aggregates SET total = total - 10 + 25;
-- delete
UPDATE aggregates SET total = total - 25;
```

Easy enough. But what happens if the events are processed out of order?

```sql
-- update
UPDATE aggregates SET total = total - 10 + 25; -- =  15
-- delete
UPDATE aggregates SET total = total - 25;      -- = -10
-- create
UPDATE aggregates SET total = total + 10;      -- =   0
```

Our result is eventually correct, but we have an unreasonable intermediate state. Our balance was `10`, `25`, and `0`. It was never `15`, let alone a negative `-10`! In many domains, this is unacceptable. But not always. So do we run into any other issues?

It turns out, a couple. They are really the same issue but in different forms. Without a `cdc_entries` (or equivalent) table:
1. You need to ensure *exactly-once* delivery. If events may get delivered more than once, you will end up with double writes.
2. You lose disaster recovery. What happens if something crashes and you need to replay some events? For the same reason as the point above... you can't. You might need to reset the current aggregate and re-calculate from the entire state of the source database.
3. You can't bootstrap your data. In our demo app, we start with an empty source database and we replicate as we go. In the real world, this almost never happens. You want to replicate an already-existing database. For that, sending events for changes is not enough, you also need some way of bootstrapping the previously-existing data. You would need to somehow time the bootstrap perfectly with the CDC events to avoid double writes, even in a *exactly-once* delivery system.

An auxiliary table storing some sort of reference and a timestamp (or LSN in our case) solves these. It can even mitigate (some) missing events, as long as a newer event arrives.

We can conceptually divide operations into **c**reate, **u**pdate, and **d**elete (CUD). There are some design decisions we need to address on our auxiliary table.

The first one is how to handle updates. We can either treat them as upserts (insert the row in `cdc_entries` with the new value if it doesn't exist) or as pure updates, in which case we will reject processing them until the row exists.

The other decision is about delete events. Do we consider them soft or hard deletes? That is, should they zero out the `cdc_entries` row or delete it?

It turns out these decisions must be taken together. We either have upserts and soft deletes or pure updates and hard deletes. This is to protect ourselves from out of order events. If we had upserts and hard deletes, a delayed update could restore something that has already been deleted.

In my opinion, the first option is superior. It is easier to reason about and more efficient in terms of latency: we can always ignore outdated events, whereas the hard delete approach requires to keep retrying for as long as possible to account for out-of-order events. The soft delete approach is less efficient in terms of space, as it will leave “tombstones” from soft deletions. Depending on how big an issue this is, it can be ignored or there could be a periodic cleanup process that deletes tombstone rows for which we are sure don't have events in flight anymore.

In fact, with this approach we can even treat delete events as upserts, which makes them even easier to reason about. Getting a Delete before its Insert is rare but not impossible. In that case, it will insert a row in `cdc_entries` with total zero, not change the aggregates, and prevent later LSNs from touching that row (including inserts).

Note that the current approach in my demo code does not consider soft deletes in the source database (`deleted_at=$timestamp`). It would need slightly different handling, like treating certain updates as deletes. Another layer of complexity could be added by supporting restore operations (setting `deleted_at` back to `NULL`), but these are —I think— relatively trivial changes.

### The algorithm

We are ready to implement our aggregation logic.

The specific implementation will change depending on the type of event. However, in all of these cases, we want to start by querying the LSN associated with our `invoice_id` in the `cdc_entries` table. If the LSN in the database is greater or equal than the one we have, we can safely drop the event: it's updated or duplicated.

Otherwise, we want to update the row (or insert a new one if it doesn't exist) with the `invoice_id`, the `total` we got from the event (`0` for deletions) and the LSN of the event.

After that, we will update the aggregates table.

Note that these operations must be done atomically. We definitely do not want to end up with changed aggregate but unchanged `cdc_entries` or the other way around. In our case, as we're using Postgres, we just wrap everything inside a transaction and call it a day.

As for how exactly to update the aggregated data:

**Create events:**

Straightforward, we just add the new value:

```rb
$current_aggregate + $new_entry_total
```

**Update events:**

The only gotcha here is to make sure `$old_entry_total` is the previously-stored total in `cdc_entries`, not the one from the event.

```rb
$current_aggregate - $old_entry_total + $new_entry_total
```

**Delete events:**

Same principle applies, with the corollary that `$old_entry_total` will be zero if it didn't exist prior to the event.

```rb
$current_aggregate - $old_entry_total
```

### Locking

Another thing to consider is that we will have multiple customers consuming events from Pulsar and trying to apply changes to the target data store. My demo actually has a potential race condition here if running multiple consumers concurrently. A `SELECT ... FOR UPDATE` is guarding the `cdc_entries` table, but I don't have any for the aggregate table.

The solution could be adding another `SELECT ... FOR UPDATE` for that table's row, or even a Redis lock if we're committing to overengineering this. For now, we will just stick to a single-process consumer, and that will fix it.


### Tools

Once this architecture is in place, with enough time and customers some requirements will appear.

First, you will likely need to bootstrap existing data into your target datastore, until it can be brought up to a state where CDC alone can keep it updated. In our case, this would require a simple script that basically:

1. Selects all the rows from the source table.
2. Wraps it in the same event format as Debezium uses
3. Send it to the right topic on Pulsar.

Astute readers might notice this has potential beyond initial bootstrapping, as it allows (some) replayability of events. By altering the query from step (1), and maybe forcing the event to be a certain type, we can adjust data as needed, and make up for missed events.

The advantage of using timestamps instead of LSNs is that, although slightly more issue-prone, they do make this process more readable, as you can fake older or newer events in an easy manner, whereas with LSNs you will usually force them to the current LSN at the time of bootstrapping, or even an artificially low one for initial setup.

Another interesting tool will become obvious when you are asked to investigate why your aggregates are not correct. Whatever the cause, a tool that is able to (1) recalculate aggregates based on `cdc_entries` and/or (2) compare `cdc_entries` to the source data for inconsistencies will prove invaluable.

{{< notice note >}} If you are curious as to how the current implementation can handle out-of-order events with no incorrect intermediate states, the rest of the post runs through a particular example. I find doing this is a very useful way to reason about events, but it is fairly boring to read. If you are not interested, there is nothing else beyond that, you can stop scrolling. Thanks for reading! {{< /notice >}}

### Appendix: Out-of-order processing examples

For all cases: assume our starting state for the aggregation DB is:
- cdc_entries: one row with `(id: 1, total: 10)`
- aggregate: `(total: 10)`

Then we will be creating a new invoice (id 2) with a total of `20`, updating it to `40` and finally deleting it. The only acceptable values for the aggregate's intermediate states are:
- `10` (before creating the second invoice or after deleting it)
- `30` (after processing the first create)
- `50` (after processing the update)

The only correct final value is the same as the starting state: `10`.

#### Happy path operation:


**CASE 1:** create `(id:2, total: 20)` ⇒ update `(id:2, total: 40)` ⇒ delete `(id:2, total: 40)`

- C: creates `cdc_entries` row
- C: increase aggregate (`10+20=30`)
- U: updates LSN in `cdc_entries`
- U: increase aggregate (`30-20+40=50`)
- D: updates LSN in `cdc_entries`
- D: decrease aggregate (`50-40=10`)

### Out-of-order arrivals:


**CASE 2:** create `(id:2, total: 20)` ⇒ delete `(id:2, total: 40)` ⇒ update `(id:2, total: 40)`

- C: creates `cdc_entries` row
- C: increase aggregate (`10+20=30`)
- D: updates LSN in `cdc_entries`
- D: decrease aggregate (`30-20=10`)
- U: event ignored - LSN too old


**CASE 3:** update `(id:2, total: 40)` ⇒ delete `(id:2, total: 40)` ⇒ create `(id:2, total: 20)`

- U: creates `cdc_entries` row
- U: increase aggregate (`10-0+40=50`)
- D: updates LSN in `cdc_entries`
- D: decrease aggregate (`50-40=10`)
- C: event ignored - LSN too old


**CASE 4:** update `(id:2, total: 40)` ⇒ create `(id:2, total: 20)` ⇒ delete `(id:2, total: 40)`

- U: creates `cdc_entries` row
- U: increase aggregate (`10-0+40=50`)
- C: event ignored - LSN too old
- D: updates LSN in `cdc_entries`
- D: decrease aggregate (`50-40=10`)


**CASE 5:** delete `(id:2, total: 40)` ⇒ update `(id:2, total: 40)` ⇒ create `(id:2, total: 20)`

- D: creates `cdc_entries` row
- D: decrease aggregates (`10-0=10`)
- All other events get ignored as their LSN is too old
