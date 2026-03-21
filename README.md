# Backend for Habit Tracker

## What is the readme for. 
The purpose of the readme is to document the whole process of developing the express application. 

### Delcaring a custom module. 
We added a custom type.d.ts for **custom-env**
which resolves the error of (no types after installing the package.)
```typescript
declare module "custom-env" {
  export function env(envName?: string, path?: string): void;
}
```
To setup and allow typescript to read that files as types, we have to setup 
```bash
pnpm add -D typescript
tsc --init
```



THE ENV SETUP
---
### Stringify takes three paramters. 
```javascript

console.error(JSON.stringify(z.flattenError(e).fieldErrors, null, 2));
```
**First** -> which object to transform. 
<br/>
**Second** -> if we want to modify/remove a field from object
<br/>
**Third** -> identation to keep when printing the object. (for human 
readable form in console.logs of server)
<br/>

---

