const test = require('ava');
const agent = require('supertest-koa-agent');
const createApp = require('../src/app');

const app = agent(createApp());

test.todo('Create SSO token')