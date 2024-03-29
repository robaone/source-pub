function Test(testClass) {
  this.tests = testClass;
  this.run = function(){
    var objectKeys = Object.keys(this.tests);
    var propertyNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this.tests));

    const keys = [...new Set([...objectKeys, ...propertyNames])];

    keys.filter(key => key.startsWith('test_')).forEach(k => {
      const before_index = keys.findIndex(key => key == 'before');
      if(before_index > -1) this.tests['before']();
      Logger.log(`Running test: ${k.substring(5)}`);
      this.tests[k]();
      const after_index = keys.findIndex(key => key == 'after');
      if(after_index > -1) this.tests['after']();
    });
  }
};

function test_assertTrue(value) {
  if(!value){
    throw "Expected true but received ("+value+")";
  }
};

class ExampleTest {
  before() {
    // This happens before every test
    Logger.log('before()');
  }
  after() {
    // This happens after every test
    Logger.log('after()');
  }
  test_testName1() {
    // This is a test
    Logger.log('GIVEN');
    Logger.log('WHEN');
    Logger.log('THEN');
    Assert.isTrue(true);
  }
  test_testName2() {
    // This is a test
    Logger.log('GIVEN');
    Logger.log('WHEN');
    Logger.log('THEN');
    Assert.isTrue(true);
  }
}

function test_ExampleTest() {
  const object = new ExampleTest();
  new Test(object).run();
}