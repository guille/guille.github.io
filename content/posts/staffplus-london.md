+++
date = 2024-06-13T12:47:32+02:00
title = "My experience @ StaffPlus London"
description = "Infiltrating a conference for 'staff, principal and distinguished engineers' as a mid-level SRE"
slug = ""
authors = []
tags = []
categories = []
externalLink = ""
+++

Last 11-12 June I had the amazing opportunity to attend the StaffPlus conference in London. As a mid-level developer, the prospect is a bit daunting. You know you will learn a lot and meet interesting people, but you are not exactly the target audience of the talks, so how valuable can it really be?

It turns out, a lot.

Listening to staff+ engineers was helpful in two main ways. Or in two main timelines. In the first group are things that may not be directly applicable now, at this point of my career. However, it was still valuable information to understand the constraints senior Individual Contributors work with, how they work around them, and what to expect when I get to that level.

The second group comprises the things I can act on *now*. I'll get into more detail further below.

For now, here are some of my (barely organised) notes for the first group:

- Build connections, talk to the engineers you work with, get to know them personally and find their strengths and professional goals.
- Staff Engineering can be a lonely job, despite interacting with multiple teams and people. It's important to build connections of people in a similar position to yours, inside or outside your company.
- Smaller companies and start-ups might not necessarily need someone with a "Staff Engineer" title but they definitely need "Staff Engineering" work being done.
	- The main advantage of smaller companies is the ability to do things that don't scale. This also applies to your possibilities as a staff engineer. You can, for example, talk to —literally— every engineer at a startup. You can't realistically do that at a bigger company. Look for ways to take advantage of that.
- Roles can help in defining expectations, it's not just a matter of status. Having a senior engineer behaving like a staff engineer will make people feel like they can't reach that progression of mid-level → senior, the gap will look too large and they will get the wrong idea.
- Titles also come with weight, and they can cause feedback to become more sparse and lower quality. At a certain point it's best to let people below you be the ones bringing up ideas instead of putting them in a position to criticise yours.
	- (Conversely, as a less senior colleague, don't be afraid to speak up)
- A scalable architecture is not only one that scales up, but also one that scales down. It is easier to prove correctness in a simple system and then scale it up than the other way around. Related: [shift left](https://devopedia.org/shift-left)
- It's easy to get into a habit of always doing the most important thing. Engineers with these responsibilities need to take a step back and delegate when appropriately. [Eisenhower matrices](https://en.wikipedia.org/wiki/Time_management#The_Eisenhower_Method) are a good framework/reminder for that.
- Tech debt can be good. Main criteria: 1) consciously adopted for a reason, 2) within a limited scope, 3) as a way to bridge to a more expensive or complicated final stage. Practical example: [Waterloo International station](https://www.mylondon.news/news/nostalgia/forgotten-london-station-eurostar-used-22696995) and its usage as an Eurostar station until profitability of the network was proven and more political capital achieved.
- Similarly, sunsetting legacy systems must be done with purpose. There needs to be a real need to do that, and a clear path to achieve that in the simplest and most painless way possible.
- "Elevating the skill level in the company is the single most impactful thing you can do".
	- It is not just about raising the bar leaving gaps behind, but pulling people up to that level before raising it again.
	- Reduce the number of things only you can do.

Some of those points already straddle the line between the first and second groups.

When looking at things I could be doing now, I can clearly differentiate two different types of learning.

Each step in the ladder of an individual contributor's progression involves, to some extent, doing "that, but more". The obvious corollary, is that one can trace it back the other way around. I can scale down the advice and techniques. While I do not make design or technical decisions for the company at large, I am definitely involved in design decisions that get made within my team, for example. A lot of the things I heard about the last couple of days can simply be applied in a proportionally smaller scale.

In some other cases, the lesson learned comes from understanding the position that staff engineers are in, and therefore using that understanding to help out. There were a few talks focused on the importance of delegation, and on the trickiness of "delegating without authority". There is a very easy way to help with this from a mid-level or senior position. Nobody will explicitly tell you this, but it's often perfectly fine to "pull" work from other people. Assuming you can still handle your workload and aren't dropping the ball on urgent matters, you can just choose to relieve more senior staff of some grunt work. With the added benefit that helping those engineers in their busywork will also help you get a wider understanding of the problems that need to be fixed.

As before, here are some more bullet points of takeaways from these past two days in this area:

- Leadership can happen at any level, independently of title.
- Staff engineers can struggle with delegating (or sometimes lack the authority to do so!), proactively take things off their plate.
- Career growth comes from putting in the work to understand things at a higher level. Not just technically, but also at the domain and financial level. Staff+ engineers are also responsible for getting that knowledge through to their peers.
- Related to the above, not every solution is technical.
- Do things for a reason, document decisions (both for future self and others).
- Debug issues in public. The number of disproven hypothesis can be used as a metric for higher ups. It is also good for knowledge sharing in general.



## Appendix: A (non-exhaustive) reading list

- *The Staff Engineer's Path*, Tanya Reilly. Also her talk [Being Glue](https://noidea.dog/glue).
- *Staff Engineer*, Will Larson
- *The Phoenix project*, Gene Kim
- *The Unicorn project*, Gene Kim
- Everything W. Edwards Deming ever wrote. Or, more realistically: *Deming's Journey to Profound Knowledge*, John Willis
- *Communication Patterns*, Jacqui Read
