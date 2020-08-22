/**
 * @name Validol.js 💊
 * A tiny lib that validates objects against a scheme, allows custom validation rules,
 * loops over arrays, and heals broken entries.
 * Supports all the paths https://www.npmjs.com/package/object-scan does.
 *
 * @module
 * @author CoMiGo
 */

/*
```js
this.validol = new Validol({
    'nested': {
        type: 'object'
    },
    'nested.property': {
        type: 'string',
        minLength: 1,
        optional: true,
        regex: /^\w+ \w+$/
    },
    'nested.uncertainProperty': {
        oneOf: [{
                type: 'string',
                length: 32,
                validator(value) {
                    return someDictionary.contains(value)
                }
            }, {
                // `value` doesn't require a type specified
                value: -1
            }]
        },
        healWith: -1 // Heal with a static value
    },
    'nested.array' {
        type: 'array',
        length: 2,
        healWith(value) { // Heal by computing new value in a function
            return [
                object.width / 2,
                object.height / 2
            ];
        }
    }
    'nested.arrray[{0,1}]': {
        type: 'number',
        finite: true,
        notNan: true
    },
    'nested.longArray': {
        type: 'array'
    },
    'nested.longArray[*]': {
        type: 'object'
    }
});

// Does nothing if an object is valid, throws an error otherwise.
this.validol.validate(obj);

// returns an array of all the paths that were healed
// `false` if it was already valid.
// Throws an error if an object cannot be healed.
this.validol.heal(obj);
```
*/

class ValidolError extends Error {
    constructor(reason, path, ruleset) {
        super(`Path ${path} has failed its checks. Reason: ${reason}`);
        this.reason = reason;
        this.path = path;
        this.ruleset = ruleset;
    }
    showRuleset() {
        // eslint-disable-next-line no-console
        console.log('Ruleset: ', JSON.stringify(this.ruleset, null, 2));
    }
}
const typePredicateMap = {
    string: value => typeof value === 'string',
    object: value => typeof value === 'object' && !Array.isArray('object') && !(value instanceof Function),
    function: value => value instanceof Function,
    array: Array.isArray,
    number: value => typeof value === 'number',
    integer: Number.isInteger,
    void: value => value === void 0,
    boolean: value => typeof value === 'boolean'
};

const applyArrayLikeRules = function applyArrayLikeRules(value, ruleset) {
    const minLength = ruleset.minLength || ruleset.length,
          maxLength = ruleset.maxLength || ruleset.length;
    if (minLength !== false && value.length < minLength) {
        throw new ValidolError(`The value's length is ${value.length}, should be at least ${minLength}.`);
    }
    if (maxLength !== false && value.length > maxLength) {
        throw new ValidolError(`The value's length is ${value.length}, should be at max ${maxLength}.`);
    }
};
const applyNumberRules = function applyNumberRules(value, ruleset) {
    if (ruleset.finite && !Number.isFinite(value)) {
        throw new ValidolError(`Value ${value} is not finite.`);
    }
    if (ruleset.notNan && !Number.isNaN(value)) {
        throw new ValidolError(`Value ${value} is not a number.`);
    }
};

const applyRuleset = function (value, ruleset) {
    /* Basic checks */
    if (ruleset.oneOf) {
        const errors = [];
        for (const subset of ruleset.oneOf) {
            try {
                applyRuleset(value, subset);
            } catch (e) {
                if (e instanceof ValidolError) {
                    errors.push(e);
                } else {
                    throw e;
                }
            }
        }
        if (errors.length === ruleset.oneOf.length) {
            for (const e of errors) {
                console.error(e);
            }
            throw new ValidolError(`Value ${value} failed all the validation rules.`);
        }
    }
    if (ruleset.value) {
        if (ruleset.value instanceof Function && value !== ruleset.value()) {
            throw new ValidolError(`Value ${value} is not equal to ${ruleset.value}.`);
        } else if (value !== ruleset.value) {
            throw new ValidolError(`Value ${value} is not equal to ${ruleset.value}.`);
        }
    }
    if (ruleset.type && !typePredicateMap[ruleset.type](value)) {
        throw new ValidolError(`Value ${value} is not of type ${ruleset.type}.`);
    }
    if (ruleset.validator && !ruleset.validator(value)) {
        throw new ValidolError(`Value ${value} did not pass the custom validator.`);
    }

    applyArrayLikeRules(value, ruleset);
    applyNumberRules(value, ruleset);
};
const applyRulesetAndHeal = function applyRulesetAndHeal(context, key, ruleset) {
    const value = context[key];
    try {
        applyRuleset(value, ruleset);
    } catch (err) {
        if (err instanceof ValidolError && ruleset.healWith) {
            if (ruleset.healWith instanceof Function) {
                const newValue = ruleset.healWith(value);
                context[key] = newValue;
            } else {
                context[key] = ruleset.healWith;
            }
            return true;
        }
        throw err;
    }
    return false;
};

class Validol {
    constructor(scheme) {
        this.scheme = scheme;
        const scan = require('object-scan');
        this.scanners = {};
        for (const path in scheme) {
            this.scanners[path] = scan([path]);
        }
    }
    heal(entity) {
        const healed = [];
        for (const path in this.scheme) {
            const ruleset = this.scheme[path];
            const targets = this.scanners[path](entity);
            if (!targets.length && !ruleset.optional) {
                throw new ValidolError(`Path ${path} does not exist.`, path, ruleset);
            }
            for (const target of targets) {
                let context = entity;
                for (let i = 0; i < target.length - 1; i++) {
                    context = context[target[i]];
                }
                if (applyRulesetAndHeal(context, target[target.length - 1], ruleset)) {
                    healed.push(target);
                }
            }
        }
        return healed;
    }
    validate(entity) {
        for (const path in this.scheme) {
            const ruleset = this.scheme[path];
            const targets = this.scanners[path](entity);
            if (!targets.length && !ruleset.optional) {
                throw new ValidolError(`Path ${path} does not exist.`, path, ruleset);
            }
            for (const target of targets) {
                let context = entity;
                for (let i = 0; i < target.length; i++) {
                    context = context[target[i]];
                }
                applyRuleset(context, ruleset);
            }
        }
    }
}

module.exports = Validol;
