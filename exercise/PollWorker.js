class PollWorker {
    constructor() {
        this.tasks = [];
        this.interval = 1000;
        this.concurrent = 1;
        this.locked = false;
        this._tmp = [];
    }
    add(task) {
        if( this.locked ){
            this._tmp.push( task )
        } else {
            this.tasks.push(task)
        }
    }
    remove(task) {
        let index = this.tasks.find(v => v === task);
        if (index > - 1) {
            this.task.splice(index, 1)
        }
    }
    async doPoll(){
        let resolved = [];
        for (let i = 0; i < this.tasks.length; i++) {
            let task = this.tasks[i];
            let result = await task();
            if (result) {
                resolved.push(i)
            }
        }
        return resolved;
    }
    async run() {
        this.locked = true;
        let resolved = await this.doPoll()
        let resolve;
        while ((resolve = resolved.pop()) > -1) {
            this.tasks.splice(resolve, 1)
        }
        this.locked = false;
        if(this._tmp.length) {
            this.tasks = this.tasks.concat( this._tmp);
            this._tmp.length = 0;
        }
        if (this.tasks.length) {
            setTimeout(()=>this.run(), this.interval)
        }

    }
}



const worker = new PollWorker();
let key = 0;
function factory(i) {
    return () => {
        return asyncFn(i)
    }
}
function asyncFn(i){
    return new Promise( (resolve, reject)=>{
        setTimeout(()=>{
            let result = Math.random();
            console.log( result, `${i}` );
            if( result < 0.4 ){
                worker.add( factory(key++))
            }
            resolve(result > 0.8);
        }, 1000)
    })
}

worker.add( factory(key++) )
worker.add( factory(key++) )
worker.add( factory(key++) )

worker.run();


