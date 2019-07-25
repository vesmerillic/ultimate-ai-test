import { ConversationEngine } from '../src/engine/ConversationEngine';
import * as troubleshootingJSON from "../src/inputs/troubleshooting.json";

describe('ConversationEngine tests', () => {

  it('Simple conversations', () => {
    let conversation = new ConversationEngine(troubleshootingJSON);
    testSimpleConversation(conversation)
    testSimpleConversation(conversation)
    testSimpleConversation(conversation)
  });

  it('Incorrect starts of conversation, cold start', () => {
    let conversation = new ConversationEngine(troubleshootingJSON);
    testIncorrectStarts(conversation)
  });

  it('Incorrect starts of conversation, after conversation', () => {
    let conversation = new ConversationEngine(troubleshootingJSON);
    testSimpleConversation(conversation)
    testIncorrectStarts(conversation)
  });

  it('Incorrect answer: retry', () => {
    let conversation = new ConversationEngine(troubleshootingJSON);
    testUnfinishedConversation(conversation)
    expect(conversation.reply('Hello')).toBe(ConversationEngine.INCORRECT_ANSWER_INPUT);
    expect(conversation.reply(null)).toBe(ConversationEngine.INCORRECT_ANSWER_INPUT);
    expect(conversation.reply(undefined)).toBe(ConversationEngine.INCORRECT_ANSWER_INPUT);
    //test answer from one of the previous questions
    expect(conversation.reply('My internet doesn\'t work')).toBe(ConversationEngine.INCORRECT_ANSWER_INPUT);
    //continue the conversation
    expect(conversation.reply('Yes')).toBe(`Contact our customer support for more help.`);
  });

  it('Incorrect answer: going back a step', () => {
    let conversation = new ConversationEngine(troubleshootingJSON);
    testUnfinishedConversation(conversation)
    expect(conversation.reply('Hello')).toBe(ConversationEngine.INCORRECT_ANSWER_INPUT);
    expect(conversation.reply(ConversationEngine.RECOVERY_ANSWER_LAST_STEP)).toBe('Have you tried resetting your router?');
    expect(conversation.reply(ConversationEngine.RECOVERY_ANSWER_LAST_STEP)).toBe('What kind of problem are you facing?');
    //trying to go up to non existing steps
    expect(conversation.reply(ConversationEngine.RECOVERY_ANSWER_LAST_STEP)).toBe('What kind of problem are you facing?');
    expect(conversation.reply(ConversationEngine.RECOVERY_ANSWER_LAST_STEP)).toBe('What kind of problem are you facing?');
  });

  it('Incorrect answer: restart conversation', () => {
    let conversation = new ConversationEngine(troubleshootingJSON);
    testUnfinishedConversation(conversation)
    expect(conversation.reply(ConversationEngine.RECOVERY_ANSWER_RESTART)).toBe('What kind of problem are you facing?');
    //restarting multiple times
    expect(conversation.reply(ConversationEngine.RECOVERY_ANSWER_RESTART)).toBe('What kind of problem are you facing?');
    expect(conversation.reply('My phone doesn\'t work')).toBe(`What is the make and model of your phone?`);
    expect(conversation.reply('iPhone X')).toBe(`Contact Apple service?`);
  });

});

function testIncorrectStarts(conversation: ConversationEngine){
  expect(conversation.reply('Hello')).toBe(ConversationEngine.INCORRECT_START_INPUT);
  expect(conversation.reply(null)).toBe(ConversationEngine.INCORRECT_START_INPUT);
  expect(conversation.reply(undefined)).toBe(ConversationEngine.INCORRECT_START_INPUT);
  expect(conversation.reply('null')).toBe(ConversationEngine.INCORRECT_START_INPUT);
  //actually start the conversation
  expect(conversation.reply('')).toBe(`What kind of problem are you facing?`);
}

function testSimpleConversation(conversation: ConversationEngine){
  expect(conversation.reply('')).toBe(`What kind of problem are you facing?`);
  expect(conversation.reply('My phone doesn\'t work')).toBe(`What is the make and model of your phone?`);
  expect(conversation.reply('Samsung Galaxy S10')).toBe(`Contact Samsung service?`);
}

function testUnfinishedConversation(conversation: ConversationEngine){
  expect(conversation.reply('')).toBe(`What kind of problem are you facing?`);
  expect(conversation.reply('My internet doesn\'t work')).toBe(`Have you tried resetting your router?`);
  expect(conversation.reply('Yes')).toBe(`Have you tried with another cable?`);
}
