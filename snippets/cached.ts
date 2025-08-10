class Cached {
    store: Map<string, Map<any, unknown>> = new Map();

    run<T>(id: string, func: Function, ...args: any[]): T | Error {
        if (!this.store.has(id)) {
            this.store.set(id, new Map());
        }

        const argstext = JSON.stringify(args)

        if (this.store.get(id)!.has(argstext)) {
            console.log('cache hit!')
            return this.store.get(id)!.get(argstext) as T;
        }

        try {
            const result = func(...args);
            this.store.get(id)!.set(argstext, result);
            return result as T;
        } catch (e) {
            return e;
        }
    }
}

export const cached = new Cached();

function sampleFunc(name: string, value: number) {
    return name + value;
}

const v1 = cached.run('sampleStore', sampleFunc, 'name', 123456)
console.log(v1)
const v12 = cached.run('sampleStore', sampleFunc, 'name', 123456)
console.log(v12)
const v2 = cached.run('sampleStore', sampleFunc, 'none', 987)
console.log(v2)
const v3 = cached.run('sampleStore', sampleFunc, 'null', 123, { a: 0 })
console.log(v3)
const v32 = cached.run('sampleStore', sampleFunc, 'null', 123, { a: 0 })
console.log(v32)
