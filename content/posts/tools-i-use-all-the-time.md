+++
date = 2025-11-09T16:40:45+01:00
title = "Building a terminal workflow"
description = "An excuse to show off different tools and scripts"
slug = ""
authors = []
tags = []
categories = [""]
externalLink = ""
draft = true
+++


I spend probably more time than I should building a workflow that feels nice to me. Part of it is because I believe it makes me more productive, but I won't hide that it's also partly because I enjoy the process itself. Since I spent a lot of time in the terminal, that's where most of my [tinkering](/posts/tinkering/) ends up happening.

Inspired by [this blog post](https://evanhahn.com/scripts-i-wrote-that-i-use-all-the-time/) by Evan Hahn that recently made the rounds in Hacker News, I wanted to share some tools and scripts that I use in my day-to-day workflow.

I will try to give credit where I can, but I have ~stolen~ taken inspiration from countless dotfiles repositories, and I haven't always been very diligent in sharing where I got things from. To be fair, I'm fairly certain some of my copypastes were from people that had copypasted it from somewhere else, that's just how it goes I suppose.

## zsh and prompt

The first thing you get when opening a terminal window is the prompt, so let's start there. Beyond all the visual niceties, I find powerlevel10k to be an amazing option thanks to its [instant prompt](https://github.com/romkatv/powerlevel10k#instant-prompt). The other way to get an instant prompt, of course, is to have a basic prompt that doesn't do anything, but that's much less fun.

Powerlevel10k is a theme for zsh, and that's the shell I have been using for years. I like all the juice you can get out of it. However, when I started using it, I remember being very annoyed at how it handled some characters. Specifically, characters like `^`. zsh handles them differently than bash, which allows for some powerful globbing expressions, but at the same time some basic commands (`git reset HEAD^`) won't work, so you need to remember to quote or escape them. You could also disable extended globbing entirely. But there's another way:

```zsh
alias git='noglob git'
alias rake='noglob rake'
```

Just like that, `git` and `rake` will take the arguments as given, and zsh won't try to pre-process them beforehand.

There are some zsh wizards out there that can do way more, though:

```zsh
fancyctrlz() {
  if [[ $#BUFFER -eq 0 ]]; then
    BUFFER="fg"
    zle accept-line
  else
    zle push-input
    zle clear-screen
  fi
}
zle -N fancyctrlz
bindkey '^Z' fancyctrlz
```

This one deserves attribution: I nicked it from [robbyki's dotfiles](https://github.com/robbyki/dotfiles/blob/c38d0beac8cea3e07134d12f289aee834c02bd55/zsh/functions.zsh#L121-L130). It admittedly took me a while to understand. Let's unpack it,

The way ctrl+z normally works is relatively simple. If there is a foreground job running, it stops it. You can then resume it in the foreground (`fg`) or the background (`bg`). This is a pretty common workflow for Vim users (before Neovim turned into a full-fledged IDE). You would do your coding in Vim, ctrl+z to put it in the background and then run tests, write commits... And then bring the editor back via `fg`.

This simple function extends ctrl+z. The if condition checks whether "BUFFER" is empty. That is, whether there is anything written in the prompt. Let's start with the first case. When it is empty, it "writes" `fg` to the buffer and then sends it (`accept-line`). This alone makes ctrl+z work to switch back and forth with a stopped job. So you can use ctrl+z to stop vim and then hit it again to bring it back. Neat.

But what about the other half? We can see it calls two {{< abbrev "Zsh Line Editor" "ZLE" >}} functions: `push-input` and `clear-screen`. The second one is —I hope— self-explanatory. For the first we can look at the docs:

> Push the entire current multiline construct onto the buffer stack and return to the top-level (PS1) prompt. If the current parser construct is only a single line, this is exactly like push-line. Next time the editor starts up or is popped with get-line, the construct will be popped off the top of the buffer stack and loaded into the editing buffer.

Or, in simpler terms, it "stores" your current buffer for later and gives you a fresh prompt. I find this surprisingly useful. It happens weirdly often that I realise, midway through writing a command, that I need to run something else first. The options are plentiful, and they all tend to suck:

1. Go to the beginning of the line, add the second command with `&&` separating them.
2. Run the first command, quickly cancel it with ctrl+c, then run the second command, maybe with `&& !!` or just running the first command normally after.
3. Copy the first command without running it, cancel the prompt, run the second command, then paste the first one and run it.

Awful stuff. Now? I just do ctrl+z, run the second command, and the first one is back on my prompt ready to go right after.

## new old tools

The last few years have seen a flurry of tools that aim to replace some staples[^1]. I have tried a few and usually ended up liking them. ripgrep, bat, fd and eza, for example, feel better than their predecessors (grep, cat, find, ls).

[^1]: [Here](https://jvns.ca/blog/2022/04/12/a-list-of-new-ish--command-line-tools/) is a nice list.

I don't have any specific tips for them other than "give them a shot", but I did want to share this:

```zsh
alias -g -- -h='-h 2>&1 | bat --language=help --style=plain'
alias -g -- --help='--help 2>&1 | bat --language=help --style=plain'
```

That sets up a [global alias](https://justingarrison.com/blog/2023-06-05-zsh-global-aliases/) that will turn something like `mycommand -h` into:

```zsh
mycommand -h 2>&1 | bat --language=help --style=plain
```

So basically it pipes the command out to `bat` with a specific syntax highlighting. Pretty neat. The only downside is the few commands that have `-h` be something other than help, but thankfully those aren't too common.

![bat's help with syntax highlighting](/images/bathelp.png)

## new new tools


Mise:
- postinstall hooks (eg doing `uv sync` or `bundle install`, setting up pre-commit hooks)
- mise.local.toml in my global gitignore


### fzf

```zsh
alias ff="fzf --preview 'bat --style=numbers --color=always {}'"
```

```zsh
awsp() {
	[[ ! -f ~/.aws/config ]] && echo "No aws config file found" && return 1

	# Use fzf for profile selection, aws CLI is VERY slow so just grep the config
	selected_profile=$(rg profile ~/.aws/config | awk '{print substr($2, 1, length($2)-1)}' | fzf --query ${1:-""} -1 --prompt="AWS Profile: ")

	if [ "$selected_profile" ]; then
		export AWS_PROFILE="$selected_profile"
	else
		echo "Unsetting profile"
		unset AWS_PROFILE
	fi
}
```

`--query ${1:-""}` means you can run it with a starting filter, like `awsp prod`.


```zsh
notes() {
	notes_dir=~/notes
	fd . $notes_dir | ff --multi --delimiter '/' --with-nth -1 --print0 --query ${1:-""} | xargs subl
}
```

### zoxide

```zsh
function zz() {
	local result
	result=$(zoxide query -l --exclude "$(__zoxide_pwd)" | fzf -1 --reverse --inline-info --query "${@:-}" --preview 'eza -1 --icons=always --color=always {}')
	if [[ -n "$result" ]]; then
		z "$result"
	fi
}
```

## other scripts

I find that writing loops in a prompt is annoying, and crafting a script every time you need one is even worse. So I just have these two aliases that have come in handy multiple times:

```zsh
untilok() { until $@; do :; done }
untilfail() { while $@; do :; done }
```

And, finally, there is **[every](https://github.com/guille/dotfiles/blob/d08a721aa0bed68b6d7b9925845f36d9c76b03a8/mybin/both/every)**. To some extent it's a generalisation of both of the above.

Since I also find myself needing to run something periodically, I asked ChatGPT to put that together, edited a couple of things and put it on my $PATH. The usage couldn't be simpler:

```zsh
every 30 s "echo 'Hello World'"                  # Run indefinitely
every 2 min "ls -la"                             # Run indefinitely
every 5 s "ping -c 2 google.com" --until-ok      # Stop when ping succeeds
every 5 s "pgrep myprocess" --until-fail         # Stop when process dies
```

Inspired by Evan's post, I also defined a `ping` alias that plays a notification-like sound, so I can do something like (real example from my terminal history trying to reproduce a flaky test)

```zsh
every 0 s "bundle exec rspec spec/path/to/spec.rb" --until-fail && ping
```
