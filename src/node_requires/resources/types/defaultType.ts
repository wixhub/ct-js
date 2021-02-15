const generateGUID = require('./../../generateGUID');

const get = function get(): IType {
    return ({
        depth: 0,
        visible: true,
        type: 'type',
        extends: {}, // should not be copied, but created
        texture: -1,
        parent: -1,
        uid: generateGUID(),
        eventArguments: {
            'core.create': {},
            'core.step': {},
            'core.draw': {},
            'core.destroy': {}
        },
        eventArgumentsID: 0
    });
};

export default get;
