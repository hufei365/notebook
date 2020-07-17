; (function () {
    const noop = () => { };
    let id = 0;
    const PENDING = 'pending';
    const FULFILLED = 'fulfilled';
    const REJECTED = 'rejected';

    function initPromise(promise, fn, resolve, reject) {
        fn.call(promise, resolve, reject);
    }
    function resolve(value) {
        this.state = FULFILLED;
        this.value = value;
        this.fulfilled.forEach(fn=>{
            fn( value );
        })
    }
    function reject(error) {
        this.state = REJECTED;
        this.value = error;
        this.rejected.forEach(fn=>{
            fn( error );
        })
    }

    class P {
        constructor(fn) {
            this.id = id++;
            this.state = PENDING;
            this.fulfilled = [];
            this.rejected = [];

            if (noop !== fn) {
                initPromise(this, fn, resolve.bind(this), reject.bind(this));
            }
        }

        then(fulfill, reject) {
            let state = this.state;
            let child = null;
            const value = this.value;
            if (state === FULFILLED) {
                child = fulfill.call(this, value);
            } else if (state === REJECTED) {
                child = reject.call(this, value);
            } else {
                child = new P(noop);
                this.fulfilled.push(fulfill);
                this.rejected.push(reject);
            }
            if(!child || !child.then){
                child = P.resolve(child);
            }
            return child;
        }

        static resolve(value){
            return value instanceof P ? value : new P(resolve=>{
                resolve(value);
            });
        }

        static reject(error){
            return error instanceof P ? error : new P((resolve, reject)=>{
                reject(error);
            });
        }
    }

    let p = new P(function (resolve, reject) {
        // resolve('1');
        reject('error init');
    });

    p.then(d=>{
        console.log(d);
        return new P(function(resolve){
            resolve('second then');
        });
    }, err=>{
        console.log(err);
        return P.reject(new Error('Test reject'));
    }).then(d=>{
        console.log(d);
        return "no thenable"
    }, err=>{
        console.log(err);
        return "finish";
    }).then(d=>{
        console.log(d);
    });
})();