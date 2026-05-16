+++
date = 2026-05-16T11:47:32+02:00
title = "Link roundup (V)"
description = "Roundup of interesting links, usually but not exclusively tech related"
url = "posts/link-roundup-5"
authors = []
tags = []
categories = ["Link roundup"]
externalLink = ""
+++


My usual procrastination habits are a great filter for checking whether the links I put together in these are evergreen. I usually gather them when I see them but then months go by before I give the post some format, add my commentary, and hit publish. That tends to leave me enough time and perspective to check whether the links are signal or noise. Maybe I'm just coping. Enjoy

**1)** I've always had issues with async/await. It feels amazing for the few places where you need it, but then the effects ripple throughout the codebase in somewhat unexpected manners. The legendary *[What Color is Your Function?](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)* captures well the issue and ends recommending Go. I do agree that Go feels nicer than async/await but there was still something _off_ about goroutines. As usual it takes someone smarter than me to put the problem into words, and that's what *[Notes on structured concurrency, or: Go statement considered harmful](https://vorpus.org/blog/notes-on-structured-concurrency-or-go-statement-considered-harmful/)* does.

On that note, if you work with Python I recommend checking out [trio](https://github.com/python-trio/trio) and watching this PyCon 2018 conference: *[Trio: Async concurrency for mere mortals](https://www.youtube.com/watch?v=oLkfnc_UMcE)*.

For a deeper understanding of async/await, David Beazley's *[Build Your Own Async](https://www.youtube.com/watch?v=Y4Gt3Xjd7G8)* is probably about as good as it gets.

**2)** A short paper, *[Seven Insights Into Queueing Theory](https://web.archive.org/web/20190702160048/http://www.treewhimsy.com/TECPB/Articles/SevenInsights.pdf)*, by Bob Wescott. The subtitle says it all: "Even if you don’t understand the math of queueing theory you can still learn from it."

For more practical advice around dealing with queues, I enjoyed *[Queuing Theory for Software Engineers](https://dzone.com/articles/queuing-theory-for-software-engineers)*.


**3)** Passkeys are great. Kind of. They're comfortable and more phishing resistant, but I worry about things like vendor lock-in (migrating away from a credential manager) and platform lock-out (can I recover my account if I lose my key?).

Firstyear's posts on passkeys (*[Passkeys: A Shattered Dream](https://fy.blackhats.net.au/blog/2024-04-26-passkeys-a-shattered-dream/)* and *[Yep, Passkeys Still Have Problems](https://fy.blackhats.net.au/blog/2025-12-17-yep-passkeys-still-have-problems/)*) are great reads to see the potential downside of passkeys.

There is a clear tension between secret ownership and security, and reading through these issues ([1](https://github.com/keepassxreboot/keepassxc/issues/10406), [2](https://github.com/keepassxreboot/keepassxc/issues/10407)) in the KeePass repo is a great litmus test to see where one falls.

I do think if you work for a large company's IT/Ops department, implementing passkeys across the board for internal systems should be a priority, though!

**4)** More on security: *[OAuth from First Principles](https://stack-auth.com/blog/oauth-from-first-principles)* is either a great resource or OAuth is actually much simpler than I thought!

**5)** I love Immich's [Cursed Knowledge](https://immich.app/cursed-knowledge) page. "Cursed knowledge we have learned as a result of building Immich that we wish we never knew." I wish other companies/people would do the same!
