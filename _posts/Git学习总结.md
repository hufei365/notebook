---
layout: post
title: git学习总结
date: 2015-10-30
tags: git
---

### git的作用
四个字：**版本控制**。版本控制用于记录若干文件内容的变化，能够便于将来查看特定时间点上该文件的基本情况。确切地说，git是一种分布式的版本管理系统，Linux的创造者Linus写的。
<!--more-->


### 版本管理方法/原理
版本控制一般分为两种：**集中化的版本控制系统** 和 **分布式版本控制系统**。
集中化的版本控制系统，顾名思义，存在一个充当管理员角色的服务器，所有人对文件修改都提交到这台服务器。其他人需要修改某个文件，那么需要首先从管理员服务器中取到这份文件的最新内容，然后在本地修改，修改完成后提交到服务器。如图：
![集中化的版本控制系统](http://7xlxb6.com1.z0.glb.clouddn.com/jicheng.jpg)

分布式版本控制系统没有中央控制管理系统，每台电脑都是一个完整的仓库。如果某人修改了文件，其他人只要重新获取一下就可以。但在实际使用分布式版本控制系统的时候，其实很少在两人之间的电脑上推送版本库的修改，因为可能你们俩不在一个局域网内，两台电脑互相访问不了，也可能今天你的同事病了，他的电脑压根没有开机。因此，分布式版本控制系统通常也有一台充当“中央服务器”的电脑，但这个服务器的作用仅仅是用来方便“交换”大家的修改，没有它大家也一样干活，只是交换修改不方便而已。如图：
![分布式版本控制系统](http://7xlxb6.com1.z0.glb.clouddn.com/distributed.png)

#### 集中式版本控制系统存储每个文件与初始版本的差异原理：*将它们保存的信息看作是一组基本文件和每个文件随时间逐步累积的差异*。
![存储每个文件与初始版本的差异](http://7xlxb6.com1.z0.glb.clouddn.com/deltas.png)


####分布式版本控制系统存储每个文件与初始版本的差异原理：*Git 不按照以上方式对待或保存数据。 反之，Git 更像是把数据看作是对小型文件系统的一组快照。 每次你提交更新，或在 Git 中保存项目状态时，它主要对当时的全部文件制作一个快照并保存这个快照的索引。 为了高效，如果文件没有修改，Git 不再重新存储该文件，而是只保留一个链接指向之前存储的文件。 Git 对待数据更像是一个 **快照流**。*
![存储项目随时间改变的快照](http://7xlxb6.com1.z0.glb.clouddn.com/snapshots.png)

**工作流**
你的本地仓库由 git 维护的三棵“树”组成。第一个是你的 工作目录，它持有实际文件；第二个是 缓存区（Index），它像个缓存区域，临时保存你的改动；最后是 HEAD，指向你最近一次提交后的结果。
![工作流](http://7xlxb6.com1.z0.glb.clouddn.com/trees.png)

**分支**
分支是用来将特性开发绝缘开来的。在你创建仓库的时候，master 是“默认的”。在其他分支上进行开发，完成后再将它们合并到主分支上。
![分支](http://7xlxb6.com1.z0.glb.clouddn.com/branches.png)

### git基础命令
#### 创建仓库
创建新文件夹，打开，然后执行 
```
git init
```
以创建新的 git 仓库。

#### 检出仓库
执行如下命令以创建一个本地仓库的克隆版本：
```
git clone /path/to/repository 
```
如果是远端服务器上的仓库，你的命令会是这个样子：
```
git clone username@host:/path/to/repository
```
#### 添加文件
你可以计划改动（把它们添加到缓存区），使用如下命令：
```
git add <filename>
```
或
```
git add *
```
"*"是通配符，表示该目录下的所有文件

#### 提交文件
这是 git 基本工作流程的第一步；使用如下命令以实际提交改动：
```
git commit -m "代码提交信息"
```
现在，你的改动已经提交到了 HEAD，但是还没到你的远端仓库。

#### 推送改动
你的改动现在已经在本地仓库的 HEAD 中了。执行如下命令以将这些改动提交到远端仓库：
```
git push origin master
```
可以把 master 换成你想要推送的任何分支。 

如果你还没有克隆现有仓库，并欲将你的仓库连接到某个远程服务器，你可以使用如下命令添加：
```
git remote add origin <server>
```
如此你就能够将你的改动推送到所添加的服务器上去了。

#### 分支管理
##### 创建分支
创建一个叫做“feature_x”的本地分支，并切换过去：
```
git checkout -b feature_x
```
这个分支并没有跟远程分支简历跟踪（track）关系，也就是说使用git pull/push的时候，并不会自动从远程的分支获取，会提示一下信息

```
$ git pull
There is no tracking information for the current branch.
Please specify which branch you want to merge with.
See git-pull(1) for details.
    git pull <remote> <branch>
If you wish to set tracking information for this branch you can do so with:
    git branch --set-upstream-to=origin/<branch> localBranch
```


如提示信息，所示要么指定远程分支<remote>，要么跟某一个远程分支建立跟踪（track）关系，命令分别是

```
git pull <remote> <branch name> //指定获取更新的远程分支
git branch --set-upstream-to=origin/<branch> <local branch name>   //与远程分支建立跟踪关系
```

##### 切换分支：
```
git checkout <branch name>
```
##### 删除本地分支：
选项 `-d`表示删除； 选项`-D`表示强制删除
```
git branch -d <branch name> // 普通删除
git branch -D <branch name> // 强制删除
```

##### 建立远程分支
将本地分支推送到远端仓库，不然该分支就是 不为他人所见的：
```
git push origin <branch>
```
##### 删除远程分支
<span style="color:red;">注意分号</span>
```
git push origin :<branch>
```

##### 清除本地已经不存在远程分支
有时候，远程分支已经被其他人删掉了，这时候，你如果使用`git branch -a`查看，依然可以看到这些分支。在这用情况下，可以使用
```
git remote prune origin
```
来清除已经废掉的远程分支


#### 更新与合并
要更新你的本地仓库至最新改动，本地分支已经与远程分支建立跟踪关系，执行：
```
git pull
```
如果未建立跟踪关系，则如之前所讲， git pull后面需要指定远程分支名称

在你的工作目录中 获取（fetch） 并 合并（merge） 远端的改动。
要合并其他分支到你的当前分支（例如 master），执行：
```
git merge <branch>
```
两种情况下，git 都会尝试去自动合并改动。不幸的是，自动合并并非次次都能成功，并可能导致冲突（conflicts）。 这时候就需要你修改这些文件来人肉合并这些冲突了。改完之后，你需要执行如下命令以将它们标记为合并成功：

```
git add <filename>
```
在合并改动之前，也可以使用如下命令查看：
```
git diff <source_branch> <target_branch>
```

#### 替换本地改动
假如你做错事（自然，这是不可能的），你可以使用如下命令替换掉本地改动：
```
git checkout -- <filename>
```
此命令会使用 HEAD 中的最新内容替换掉你的工作目录中的文件。已添加到缓存区的改动，以及新文件，都不受影响。

假如你想要丢弃你所有的本地改动与提交，可以到服务器上获取最新的版本并将你本地主分支指向到它：
```
git fetch origin
git reset --hard origin/master
```

#### 删除文件
```
git rm  -r -n --cached   */bin
```
表示删除所有目录下的bin目录
`-n`: 只是查看要删除的文件，并不真正删除；去掉这个选项就会删除文件；


#### 标签管理
查看标签列表
```
git tag 
或 
git tag -l
```
可以指定`pattern`

基于某个标签创建分支：
```
git checkout -b <branch_name> <tag_name>
```
创建的分支属于本地分支
