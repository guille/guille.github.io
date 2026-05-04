+++
date = 2026-03-26T16:59:32+01:00
title = "The Copilot key does what?"
description = "Wait, what's a Copilot key?"
slug = ""
authors = []
tags = []
categories = []
externalLink = ""
+++

I changed jobs a couple of weeks ago and got a nice Thinkpad, with Fedora installed. On the right-hand side of the keyboard, where one would expect keys like Super_R, Menu, Ctrl_R, right between Alt Gr and the fingerprint reader there was... something else. I didn't think much of it at first, I even assumed it was the Menu key, but I accidentally pressed it in combination with "2" and it triggered one of my shortcuts.

To be more precise, it triggered a shortcut I have bound to `Super + Shift + 2`. That didn't make any sense. How could this key, which I was assuming was Menu, possibly be sending these keys?

So I started Googling. It turns out, it's not a weird-looking Menu key, it's a [Copilot key](https://www.microsoft.com/en-us/windows/learning-center/unlock-productivity-with-the-copilot-key). That's apparently a thing. I do wonder about the economics of it. Do laptop makers get paid by Microslop to add it? Is it a condition of the partnership with Lenovo? Did they just pay the first couple and the rest followed through fearing looking out with the times?

In any case, after some more Googling, I came across [this xwitter thread](https://x.com/dcolascione/status/2019936377408811319). Lo and behold, I quickly confirmed that's the same set of key events that my keyboard sends when this key is pressed.

The first thing I tried was binding it to something else [on Hyprland](https://github.com/hyprwm/Hyprland/discussions/10076#discussioncomment-12852164), which works in the sense that pressing the key triggers the bind, but since the window manager is still seeing Super + Shift, if I mistakenly hit 2, the same shortcut gets executed.

The way out is fairly simple once we're here, as a lot of people before me have been puzzled about this key and tried to remap it, particularly on Linux. There are [short tutorials](https://old.reddit.com/r/linux4noobs/comments/1jfnyyq/remap_copilot_key_to_the_context_menu_key_keyd/) out there on how to do just that. What follows is mostly my notes on what I did in case I ever need to repeat it.

1. Install [keyd](https://github.com/rvaiya/keyd)
2. Run `keyd monitor` and press the key. This should show an output like this, where we care about the keyboard ID (`0001:...`) and the key sequence:
```
AT Translated Set 2 keyboard    0001:0001:09b4e68d      leftmeta down
AT Translated Set 2 keyboard    0001:0001:09b4e68d      leftshift down
AT Translated Set 2 keyboard    0001:0001:09b4e68d      f23 down
AT Translated Set 2 keyboard    0001:0001:09b4e68d      f23 up
AT Translated Set 2 keyboard    0001:0001:09b4e68d      leftshift up
AT Translated Set 2 keyboard    0001:0001:09b4e68d      leftmeta up
```
3. We get the list of keys we can map to from `keyd list-keys`
4. Open /etc/keyd/default.conf and configure it like so:
```
[ids]
0001:0001:09b4e68d

[main]
leftshift+leftmeta+f23 = compose
```
5. Start and enable keyd: `sudo systemctl enable keyd --now`

In case you're wondering, I don't use right control almost ever, but I do heavily use Menu, which I set to act as the [compose key](https://en.wikipedia.org/wiki/Compose_key).
