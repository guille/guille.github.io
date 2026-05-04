+++
date = 2026-05-01T11:26:32+02:00
title = "Agentic engineering in reverse"
description = "Letting the AI drive me"
slug = ""
authors = []
tags = []
categories = []
externalLink = ""
+++

One of the many projects I had started over the last few months was a daemonized shell. I wanted to understand how terminals work more in depth, and how tmux does what it does. In order to do that, I started building a very simple PTY daemon. My idea was something like: I want to be able to daemonize a shell, and then have some sort of listening process that controls it and can send bytes to it. That felt like the bare minimum to get something working that I would actually bring myself to finish, even if it wouldn't have the polish I'd want in order to open-source it or do any sort of demo.

It is at that point where laziness usually kicks in. I archive the project and move on to other things. However, there were two things that made me curious if I could do something different:
1. I've been using and enjoying Ghostty, and wanted to find out how to try libghostty in this project *somehow*.
2. Github's strange decision to give users what amounts to unlimited compute via Copilot's pricing model ([soon to be changed](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/)).

I set up Opus 4.6 on the project, told it it was only allowed to write the tests (the project would have shipped with zero tests otherwise) and started spawning subagents to review the code and propose improvements. I couldn't really tell you _why_ I did it, but I figured it would be interesting to do things the other way around. Most of the time I've been looking at code and telling the AI to change it. Or I'd change a method signature and tell the AI to {{< sidenote "change all the callers," >}}
The sort of grueling work the AI decided was best to delegate to another subagent which, upon noticing it couldn't spawn yet another minion, wrote a Python script to parse and replace occurrences instead of going one by one.
{{< /sidenote >}} stuff like that.

It helped that this is outside of my usual domain: close enough that I know what I'm doing but still unfamiliar with the patterns that I don't know what I don't know. Despite working in Python, this had enough low-level components that I had never really encountered before

> Opus: The way you're doing signal handling here is dangerous, you should consider implementing a self-pipe and letting your event loop do the handling.

... what the hell is a self-pipe? Turns out [the concept is really easy to grok](https://nimfsoft.art/blog/2025/07/23/c-safe-signal-handling-self-pipe/): instead of doing everything in your signal handler, this handler should be thin and simply delegate to an event loop that something has happened. Since my implementation was basically a big event loop, this was easy to solve, I just didn't know I had to do that!

Beyond discovering a few unknown unknowns, this approach had a sort of psychological boon that made me get less lazy. Honestly, the chances of me implementing back-pressure handling in a project like this would usually be in the sub-1% range. After a while, though, we got to a point where that was the most important item on every review round ,so I eventually caved and implemented it.

By the time I got through the list I had ended up with a much better implementation than what I started with. It even had tests! The architecture had improved to the point where I started to wonder "how far are we from a simple tmux"? The client I had been using was a simple unidirectional REPL to send commands to the daemonized shell, which was cool and all, but now I was getting ambitious and wanted to stream back the result and duplicate the terminal.

> Opus: You could send a new request type "ATTACH", which the server accepts. The client, upon receiving confirmation, switches its own terminal to raw mode and connects both sockets together.

So I got on that. I let Opus write the client and I started on the server-side part. I got it mostly working (no, Opus, I don't want to deal with SIGWINCH, leave me alone).

At that point the next step was obvious: if I can connect two terminals together, why not a browser? This is where libghostty comes in. Particularly, [ghostty-web](https://github.com/coder/ghostty-web). Opus cranked out an HTML file that was borderline plagiarism of ghostty-web's demo page and we were off to the races: the Python back-end attaches to the daemonized shell and sends bytes back and forth to the frontend's terminal. That means I can now daemonize a shell on my desktop, start this webserver and connect to the shell via the browser on my phone through tailscale or something. I could also stream my terminal to the Internet and measure how long it takes until someone removes all my french files (`rm -fr`) in a more interactive version of TwitchInstallsArchLinux[^1]. I could do a cursed version of pair programming with a coworker next time screen-sharing proves too hard a task for Wayland.
[^1]: I ended up adding a toggle to the web server so it could force read-only mode.

There are simpler ways of doing all that, and I'm not even sure I will be using this at all, but I find being able to implement something, even if it's useless, is very helpful in understanding it.

## The demo

You can find the [code on Github](https://github.com/guille/dmn).

{{< video src="/videos/dmn.mp4" type="video/mp4" muted="true" poster="/videos/dmn-poster.jpg" >}}

Commentary:
1. I start with three windows open, vertically split. From left to right:
	- two shells open in a Ghostty vertical split.
	- a shell open on Sublime Text.
	- the browser with the web demo.
2. I daemonize both Ghostty shells, one with the default name and another with name `editor`.
3. I attach the editor shell to the `editor` session.
4. The web was trying to connect to `default` all that time.
5. I run some commands, which are mirrored on the paired shells.
6. I disconnect the web client from `default` and connect it to the `editor` session.
7. Running commands on one of the shells connected to `editor` now appear on the other two.
8. I re-connect the web client in read-only mode. It won't accept any input from there but it still streams output.
