import { DelayHanlderPromise } from './delayBase.js';

class ModuleClass extends DelayHanlderPromise {
	constructor() {
		super({});
	}
    
}

const ModuleResolver = new ModuleClass();

export default ModuleResolver;
