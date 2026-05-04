+++
date = 2025-08-22T17:00:32+02:00
title = "Getting Sublime LSP working in Ruby"
description = "The resistance to Visual Studio Code hegemony is still going strong"
slug = ""
authors = []
tags = []
categories = []
externalLink = ""
+++

A Language Server Protocol (from here on, LSP) is a very useful developer companion. In a nutshell, it allows text editors to get some of the features of a fully-fledged IDE: smarter autocomplete, formatting, refactoring tools, documentation, etc.

Despite everyone's obsession with Visual Studio Code, I have stayed true to Sublime Text, which works perfectly fine for me. But what's the LSP support like? Well, it turns out, it is not as good as Visual Studio Code's but it is not bad at all.

## The Sublime LSP experience

You just need to install [SublimeLSP](https://lsp.sublimetext.io/), which will act as an interface between Sublime Text and the language servers proper. After that, the experience comes down to each plugin.

So far I have only tried five of them:

1. LSP-json works out of the box, nothing to do. It does seem surprisingly powerful via its custom schemes, which has both helped me (when it correctly detected eg a docker-compose file and provided the inline documentation I needed) and annoyed me (when it incorrectly thought a random json file had to follow a specific schema).
2. Similar experience for LSP-yaml.
3. LSP-gopls is also quite nice, only requiring a working Go installation, with the plugin in charge of installing and updating gopls by itself. However, I will say I haven't used Go professionally, so there might be some issues I simply haven't ran into in my toy projects.
4. LSP-OmniSharp caused me some headaches by refusing to start when $DOTNET_ROOT was not set, despite `dotnet` being in my $PATH. On the plus side, once I switched to managing my dotnet versions with [mise](https://mise.jdx.dev/) the issue (and my ugly hack to work around it) went away. It also installs and updates OmniSharp for you.
5. `ruby-lsp` works... mostly fine. The autocompletion gets better, there are some helpful things here and there but I still have to open the docs on my browser every so often.

Overall, a fairly good showing. Considering LSP was designed by Microsoft for Visual Studio Code and how many resources have gone into it —sometimes at the expense of other editors, or at least editor-agnostic solutions— it is to be expected the user experience is superior. But Sublime Text is catching up, albeit slowly.

In any case, the reason I wrote this was to show where my biggest pain point was and how to address it.


## Gemfile location issues?

{{< notice note >}} I basically wrote this for my future self. Unless you're in the same situation, you can probably stop reading here. {{< /notice >}}

Some repositories at my current company were set up in strange ways. While I understand wanting to separate source code from other things (configuration, CI actions, documentation...) these repositories also had the Gemfile and Gemfile.lock in the `src/` directory.

Now, I will admit this makes some things easier: for example, your `.dockerignore` needs to have way less things, you can just copy only the `src/` and any other explicit folder. But it's a pain when working on an editor. It makes the repo feel like a monorepo when it really isn't.

Over the last few weeks I kept running into issues where some of the repos would have the LSP auto-format on save and some wouldn't. It wasn't until today that I narrowed it down: the repositories where the feature was working had a root-level Gemfile/Gemfile.lock. The way `ruby-lsp` works is that it will create its own `.ruby-lsp` directory on the top-level folder and create its own Gemfile there. This is a very smart way to avoid making the user declare `ruby-lsp` as a dependency. In order to load the project dependencies, it asks Bundler to find a Gemfile and loads it on top of that.

The issue is that Bundler only searches "up" when looking for Gemfiles. So if the directory root doesn't have one, you're out of luck and `ruby-lsp` will assume you have no gems. Including rubocop. So no autoformatting, nothing.

So here are two ways to fix that.


### Option 1: Open both folders in the project

This one is a bit clunkier but it only needs changes in the editor.

Whereas the normal `.sublime-project` files I was using (*Project -> Edit Project*) were like this:

```json
{
    "folders": [
        {
            "path": "/Users/me/my_project_root"
        }
    ]
}
```

I edited it to look like this (the name is optional):

```json
{
    "folders": [
        {
            "path": "/Users/me/my_project_root/src",
            "name": "my_project_root (src)"
        },
        {
            "path": "/Users/me/my_project_root",
            "folder_exclude_patterns": [
                "src/"
            ],
        },
    ]
}
```

That leaves you with two folders, one containing all the top-level stuff in case you need to edit anything, and another with just the source code, with a top-level Gemfile which will get pulled in by ruby-lsp.

It works, but for single-project repositories I kind of hate it. While I don't normally use the tree view too often, it's still useful sometimes, and this makes it much uglier.

I would probably use this option in a monorepo or if at least there was more than one fairly-independent projects that I wanted to open at the same time, like

```json
{
    "folders": [
        {
            "path": "/Users/me/my_project_root/backend",
            "name": "backend"
        },
        {
            "path": "/Users/me/my_project_root/frontend",
            "name": "frontend"
        },
        {
            "path": "/Users/me/my_project_root",
            "folder_exclude_patterns": [
                "backend/",
                "frontend/"
            ],
        },
    ]
}
```

### Option 2: Create a root Gemfile

Well, if `ruby-lsp` needs a root-level Gemfile, why not create one? It barely requires any setup, doesn't mess with any other tools and might even fix a couple while it's at it!

You just have to create a top-level Gemfile with:

```rb
eval_gemfile(File.expand_path("src/Gemfile", __dir__))
```

If your project/repository has a bunch of Gemfiles and it still makes sense to have them together (as opposed to opened as different projects), you can just keep stacking `eval_gemfile` statements.

You will, however, need to `bundle install`. as `ruby-lsp` expects a Gemfile.lock to exist.

The only issue this can have is social: other people may not like you adding this to a repo, in which case you can configure a personal .gitignore and add top-level Gemfiles to it. This would only cause problems if you're creating a new repo and you want to add a root-level Gemfile, but you just need one `git add -f Gemfile` to get around it.

```sh
git config --global core.excludesFile ~/.gitignore
echo "/Gemfile" >> ~/.gitignore
echo "/Gemfile.lock" >> ~/.gitignore
```
