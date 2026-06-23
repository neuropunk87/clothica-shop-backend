import { AdminJSOptions } from 'adminjs';

import { resources } from '../../../src/admin/resources.js';

import componentLoader from './component-loader.js';

const options: AdminJSOptions = {
  componentLoader,
  rootPath: '/admin',
  resources: resources as AdminJSOptions['resources'],
  databases: [],
};

export default options;
