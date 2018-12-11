/**
title: 在CentOS7 上安装jekyll及简单使用
date: 2018-06-15
tags: Jekyll,静态博客
*/


### 在CentOS7 上安装jekyll及简单使用


首先来说，jekyll的运行依赖于Ruby。在安装的过程中遇到的问题主要是Ruby的安装问题。

话不多说，先`yum update`;
```shell
yum -y update
```

#### 安装RVM
最开始尝试了`yum install ruby`，但是安装的Ruby版本是2.0，这个低于jekyll的版本要求（>=2.2.5）。后来 在网上找到了使用`RVM`安装Ruby的方法。
RVM(Ruby Version Manager)，可以看出是Ruby的版本管理工具。

下面是安装RVM并使之生效的步骤
```shell
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
\curl -sSL https://get.rvm.io | bash -s stable
source /etc/profile.d/rvm.sh
```

#### 安装Ruby
```shell
rvm install ruby
```

#### 安装jekyll
```shell
gem install jekyll bundler
```

#### jekyll的简单使用
```shell
# Create a new Jekyll site at ./myblog
jekyll new myblog

# Change into your new directory
cd myblog

# Build the site on the preview server
bundle exec jekyll serve

# Now browse to http://localhost:4000

# => The current folder will be generated into ./_site
jekyll build

# => The current folder will be generated into ./_site,
#    watched for changes, and regenerated automatically.
jekyll build --watch

# => A development server will run at http://localhost:4000/
# Auto-regeneration: enabled. Use `--no-watch` to disable.
jekyll serve
# => A development server will run at http://localhost:4000/
# Auto-regeneration: enabled. Use `--no-watch` to disable.

# LiveReload refreshes your browser after a change.
jekyll serve --livereload

# Incremental will perform a partial build in order to reduce regeneration time.
jekyll serve --incremental

# => Same as `jekyll serve` but will detach from the current terminal.
#    If you need to kill the server, you can `kill -9 1234` where "1234" is the PID.
#    If you cannot find the PID, then do, `ps aux | grep jekyll` and kill the instance.
jekyll serve --detach
```


【参考资料】
[How to install Jekyll on CentOS 7](https://www.rosehosting.com/blog/how-to-install-jekyll-on-centos-7/)