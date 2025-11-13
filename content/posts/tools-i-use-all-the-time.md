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


I've previously written about [tinkering](/posts/tinkering/). I spend probably more time than I should building a workflow that feels nice to me. Since I spent a lot of time in the terminal, that's where most of my tinkering ends up happening.

Inspired by [this blog post](https://evanhahn.com/scripts-i-wrote-that-i-use-all-the-time/) by Evan Hahn that recently made the rounds in Hacker News, I wanted to share some tools and scripts that I use in my day-to-day workflow.

I will try to give credit where I can, but I have ~stolen~ taken inspiration from countless dotfiles repositories, and I haven't always been very diligent in sharing where I got things from. To be fair, I'm fairly certain some of my copypastes were from people that had copypasted it from somewhere else, that's just how it goes I suppose.

The first thing you get when opening a terminal window is the prompt, so let's start there. Beyond all the visual niceties, I find powerlevel10k to be an amazing option thanks to its [instant prompt](https://github.com/romkatv/powerlevel10k#instant-prompt). The other way to get an instant prompt, of course, is to have a basic prompt that doesn't do anything, but that's much less fun.

The last few years have seen a flurry of tools that aim to replace some staples



Mise:
- postinstall hooks (eg doing `uv sync` or `bundle install`, setting up pre-commit hooks)
- mise.local.toml in my global gitignore


## fzf


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

```zsh
alias ff="fzf --preview 'bat --style=numbers --color=always {}'"
```

```zsh
notes() {
	notes_dir=~/notes
	fd . $notes_dir | ff --multi --delimiter '/' --with-nth -1 --print0 --query ${1:-""} | xargs subl
}
```

## zoxide

```zsh
function zz() {
	local result
	result=$(zoxide query -l --exclude "$(__zoxide_pwd)" | fzf -1 --reverse --inline-info --query "${@:-}" --preview 'eza -1 --icons=always --color=always {}')
	if [[ -n "$result" ]]; then
		z "$result"
	fi
}
```

## bat

Nicer help texts with bat
```zsh
alias -g -- -h='-h 2>&1 | bat --language=help --style=plain'
alias -g -- --help='--help 2>&1 | bat --language=help --style=plain'
```


## zsh niceties and scripts

```zsh
# robbyki's dotfiles
# ctrl+z can now back&forth with suspended jobs
# if there's text in the buffer, save it for next line
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


# fix refspec characters (^, @, ~) in zsh
```zsh
alias git='noglob git'
alias rake='noglob rake'
```


```zsh
untilok() { until $@; do :; done }
```
```zsh
untilfail() { while $@; do :; done }
```

also scripts/every

