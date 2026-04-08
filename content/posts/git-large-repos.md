+++
date = 2026-04-08T20:39:32+02:00
title = "Working with large Git repositories"
description = "Notes on how to stop feeling the pain"
slug = ""
authors = []
tags = []
categories = []
externalLink = ""
+++

I have recently joined a startup with a staggering number of repositories for the size of the team. The repos are all quite small, though. Behind me are the days working with the Rails monolith that made git operations feel slow. I like things to be snappy, so I'm just writing my notes so I don't forget them for next time I need them. These notes are mostly for myself, but if you find them useful —or incorrect— feel free to let me know.

Disclaimer: I have never worked anywhere that used [git-lfs](https://git-lfs.com/) so I have no clue how to operate that.

Disclaimer 2: Git now ships with [scalar](https://git-scm.com/docs/scalar) which seems really useful for automatically dealing with many of these. That link is probably worth checking out more than the rest of this.

## Day to day operations

The one setting that is probably a general recommendation (meaning, even if you don't work with large repositories, it is probably a good idea to enable) is `core.untrackedCache`. You can read more about it [here](https://git-scm.com/docs/git-update-index#_untracked_cache).

The biggest gain is probably enabling maintenance on your large repositories. This automates various repository optimization tasks. To enable maintenance tasks, simply run this command from inside the repo:

```sh
git maintenance start
```

Since I track my gitconfig, I point it to a separate file that I then include from the main config:

```sh
git maintenance start --config-file ~/.gitconfig.local
```

From [the docs](https://git-scm.com/docs/git-maintenance), Git maintenance automates the following:

> - commit-graph: Updates and verifies commit-graph files incrementally.
> - prefetch: Updates the object directory with the latest objects from all registered remotes.
> - gc: Cleans up unnecessary files and optimizes the local repository.
> - loose-objects: Cleans up loose objects and places them into pack-files.
> - incremental-repack: Repacks the object directory using the multi-pack-index feature.
> - pack-refs: Consolidates loose reference files into a single file.

On top of that, when working with large repos it is also recommended to set `maintenance.strategy` to `geometric`.

I think this works well for most cases, but if you want some extra speed, you can try out:

- enabling `feature.manyFiles` (uses a smaller index file, making commands like `git add` faster)
- enabling `core.fsmonitor` (spawns a daemon to monitor files that makes operations like `git status` much faster)

## Sporadically working with large repositories

While the strategies above are aimed at repos you work with often, sometimes you just need to clone a very large repo to your machine for a one line change or something. It hurts to see it clone for ten minutes, doesn't it?

I think a lot of people know about `git clone --depth 1` to only clone the last commit, but sometimes avoiding the history is not enough, and the repo itself is still quite heavy. For the record, `git clone` also takes a `--shallow-since` flag that lets you control how far back to go. It might be interesting to reduce the size of some repos by some amount.

In any case, as I was saying, you might want something more drastic. I have no clue how to actually use them (I tried once and failed miserably) but Git has `sparse-checkout` and a sparse-index options that might be interesting here.

## Manual cleaning

Most of this should be unnecessary if you are using git maintenance, but:

```sh
# Check repository integrity during pruning
git fsck --unreachable
# Remove unreachable objects immediately
git prune
# Garbage collector
git gc --aggressive --prune=now
```

I also have this alias that I use often to remove stale branches from my local that have been merged upstream:

```sh
prune-branches = "!git fetch -p && for branch in $(git for-each-ref --format '%(refname) %(upstream:track)' refs/heads | awk '$2 == \"[gone]\" {sub(\"refs/heads/\", \"\", $1); print $1}'); do git branch -D \"$branch\"; done"
```
