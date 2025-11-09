+++
date = 2025-10-31T16:40:45+01:00
title = "Tools I use all the time"
description = "TODO"
slug = ""
authors = []
tags = []
categories = ["Tool spotlights"]
externalLink = ""
draft = true
+++



Following https://evanhahn.com/scripts-i-wrote-that-i-use-all-the-time/

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
	fd . $notes_dir | ff --multi --delimiter '/' --with-nth -1 --print0  | xargs subl
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

