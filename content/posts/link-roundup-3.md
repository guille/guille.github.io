+++
date = 2024-09-12T14:47:32+02:00
title = "Link roundup (III)"
description = "Roundup of interesting links, usually but not exclusively tech related"
slug = ""
authors = []
tags = []
categories = ["Link roundup"]
externalLink = ""
+++

**1)** In 1983, Ken Thompson, one of the pioneers and giants of computer science, received the Turing award. His acceptance speech, "Reflections on Trusting Trust", presents a fascinating attack vector. You can read about it [here](https://dl.acm.org/doi/pdf/10.1145/358198.358210).

**2)** Russ Cox, over at swtch, has a great explainer going into further detail on how this would work, implementing it, and how the Go compiler avoids it: *[Running the “Reflections on Trusting Trust” Compiler](https://research.swtch.com/nih)*

**3)** Finally, there is also a short story *[Coding Machines](https://www.teamten.com/lawrence/writings/coding-machines/)* based on that idea. The [CoRecursive podcast](https://corecursive.com/coding-machines-with-don-and-krystal/) performed the audio version if you prefer listening.

**4)** I'm very interested in the idea of data ownership. It's one thing to be forced into someone else's platform, but why can't I at least keep my data? Most —but definitely not all— platforms support an extract feature, but can we go further? Martin Kleppmann (of *Designing Data-Intensive Applications* fame) and a few collaborators seem to think that, and consider CRDTs the basic foundational tool for that. Read up more on inkandswitch: *[Local-first software: you own your data, in spite of the cloud](https://www.inkandswitch.com/local-first/)*

**5)** One of the advantages of being a software engineer is you have the ability to build bespoke solutions for yourself and your family. And yet I feel not that many people take advantage of it. Part of the reason is the conditioning we have over building things: they must be scalable, they must be professional, you need to think about how to monetize them. That's not true, says Robin Sloan: *[An app can be a home-cooked meal](https://www.robinsloan.com/notes/home-cooked-app/)*

**6)** The README of this repo reads:

> The goal of this project is to collect software, numbers, and techniques to quickly estimate the expected performance of systems from first-principles.

And that's exactly what *[napkin-math](https://github.com/sirupsen/napkin-math)* provides.

**7)** Old news at this point, but I thoroughly enjoyed Anthropic's *[Mapping the Mind of a Large Language Model](https://www.anthropic.com/research/mapping-mind-language-model)* on understanding LLMs and how they work. And I had fun playing with their Golden Gate-obsessed AI back in May.


**8)** We close this roundup with a classic: Google employee explains internal process of the company, the world is fascinated. In this case, the concept of *[Readability: Google's Temple to Engineering Excellence ](https://www.moderndescartes.com/essays/readability/)*. As much as I dread the overhead of having to ask for more reviews, I have to admit when I have to open PRs in languages I'm not so proficient in I would quite appreciate one of these. And reviewing PRs by others where I am more comfortable in the language is also a good quality control. So maybe they're onto something here!
