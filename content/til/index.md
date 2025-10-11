+++
title = 'TIL'
date = 2025-05-21T20:07:58+02:00
+++

Following [established](https://jvns.ca/til/) [precedent](https://til.simonwillison.net/).

## Serialisation

{{% til title="JSON leaves numeric precision as an implementation detail" %}}
As usual with ser-des operations, it is paramount to have explicit agreements between sender and receiver.
[Source](https://stackoverflow.com/questions/79481779/are-json-numbers-always-double-precision-floating-point-numbers)
{{% /til  %}}

## Shell

{{% til title="Get completion context (zsh)" %}}
You can do `C-x h` to get zsh's completion context.
{{% /til  %}}

## Databases

{{% til title="Deferred joins" %}}
You can speed up a query like

```sql
 SELECT *
 FROM
   people
 ORDER BY
   birthday, id
 LIMIT 20
 OFFSET 450000;
```

By rewriting it as

```sql
 SELECT * FROM people
 INNER JOIN (
   SELECT id FROM people ORDER BY birthday, id LIMIT 20 OFFSET 450000
 ) AS people2 USING (id)
 ORDER BY
   birthday, id
```
{{% /til  %}}

## Random/non-technical

{{% til title="Check for holidays" %}}
Obvious in retrospect, but when working with different countries in B2B it helps to check when their holidays are.
{{% /til  %}}

