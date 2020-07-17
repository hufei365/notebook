https://engageinteractive.co.uk/blog/top-10-scss-mixins
https://github.com/engageinteractive/core/tree/master/src/scss/utility

``` css
@mixin css-triangle($color, $direction, $size: 6px, $position: absolute, $round: false){
    @include pseudo($pos: $position);
    width: 0;
    height: 0;
    @if $round {
        border-radius: 3px;
    }
    @if $direction == down {
        border-left: $size solid transparent;
        border-right: $size solid transparent;
        border-top: $size solid $color;
        margin-top: 0 - round( $size / 2.5 );
    } @else if $direction == up {
        border-left: $size solid transparent;
        border-right: $size solid transparent;
        border-bottom: $size solid $color;
        margin-bottom: 0 - round( $size / 2.5 );
    } @else if $direction == right {
        border-top: $size solid transparent;
        border-bottom: $size solid transparent;
        border-left: $size solid $color;
        margin-right: -$size;
    } @else if  $direction == left {
        border-top: $size solid transparent;
        border-bottom: $size solid transparent;
        border-right: $size solid $color;
        margin-left: -$size;
    }
}
```

http://zerosixthree.se/8-sass-mixins-you-must-have-in-your-toolbox/

https://www.hongkiat.com/blog/mixin-library-for-sass/

https://www.internetrix.com.au/blog/10-sass-scss-mixins-you-will-use-every-day/

https://w3bits.com/sass-mixins/

http://thesassway.com/advanced/pure-sass-functions

https://github.com/RusinovAnton/scss-mixins-collection

https://alistapart.com/article/dry-ing-out-your-sass-mixins/

https://www.developerdrive.com/2018/05/10-best-sass-mixins-for-web-developers/


https://gist.github.com/jareware/4738651

https://hugogiraudel.com/2013/08/12/sass-functions/

http://selfteach.me/sass-extends-mixins-functions/

https://github.com/crissdev/bootstrap-scss