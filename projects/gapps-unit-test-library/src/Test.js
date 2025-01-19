function Test(testClass) {
    const tests = testClass;
    this.run = function () {
        const results = { passed: 0, failed: 0, errors: [] };
        const objectKeys = Object.keys(tests);
        const propertyNames = Object.getOwnPropertyNames(Object.getPrototypeOf(tests));

        const keys = [...new Set([...objectKeys, ...propertyNames])];

        keys.filter(key => key.startsWith('test_')).forEach(k => {
            try {
                if (typeof tests.before === 'function') tests.before();
                Logger.log(`Running test: ${k.substring(5)}`);
                tests[k]();
                results.passed++;
            } catch (error) {
                results.failed++;
                results.errors.push(`${k}: ${error.message || error}`);
                Logger.log(`Test failed: ${k} - ${error.message || error}`);
            } finally {
                try {
                    if (typeof tests.after === 'function') tests.after();
                } catch (error) {
                    Logger.log(`After hook failed: ${error.message || error}`);
                }
            }
        });
        Logger.log(`${results.passed} tests passed`);
        Logger.log(`${results.failed} tests failed`);
        results.errors.forEach((error) => Logger.log(error));
        return results;
    }
};

var Assert = {
    isTrue(value) {
        if (value !== true) {
            throw new Error('Value is not true');
        }
    },
    match(expected, actual) {
        if (expected != actual) {
            throw new Error(`Expected value is (${JSON.stringify(expected)}) but is (${JSON.stringify(actual)})`);
        }
    },
    equals(expected, actual) {
        if (expected !== actual) {
            throw new Error(`Assertion failed: expected ${expected}, but got ${actual}`);
        }
    },
    deepEquals(obj1, obj2) {
      // Check if both arguments are of the same type
      if (typeof obj1 !== typeof obj2) {
        throw new Error(`Objects are not the same type: ${typeof obj1} != ${typeof obj2}`);
      }

      // Handle arrays
      if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
          throw new Error(`Arrays have different lengths: ${obj1.length} !== ${obj2.length}`);
        }
        for (let i = 0; i < obj1.length; i++) {
          try{
            this.deepEquals(obj1[i], obj2[i]);
          }catch(error) {
            throw new Error(`Arrays differ at index ${i}: ${error.message}`);
          }
        }
        return true;
      }

      // Handle objects
      if (typeof obj1 === 'object' && obj1 !== null && typeof obj2 === 'object' && obj2 !== null) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
          throw new Error(`Objects have different number of keys: ${keys1.length} !== ${keys2.length}`);
        }

        for (const key of keys1) {
          if (!keys2.includes(key)) {
            throw new Error(`Key "${key}" missing from second object`);
          }
          try {
            this.deepEquals(obj1[key], obj2[key]);
          } catch (error) {
            throw new Error(`Objects differ at key "${key}": ${error.message}`);
          }
        }
        return true;
      }

      // Handle primitive values
      return obj1 === obj2;
    }
};

/**
 * Copy this class and test_Example function to your implementation file.
 * Change the class name and test name to match the class that you are testing.
 */
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
        Assert.equals(true,false);
    }
    test_testName2() {
        // This is a test
        Logger.log('GIVEN');
        Logger.log('WHEN');
        Logger.log('THEN');
        Assert.isTrue(true);
    }
    test_testName3() {
      const expected = {this: "that", the: "other"};
      const actual = {this: "that", the: "other"};
      Assert.deepEquals(expected,actual);
    }
}

function test_Example() {
    const object = new ExampleTest();
    new Test(object).run();
}
