const { parseArgument } = require("../lib/functionParser");
const cache = require("static-memory");

class Validator {
  constructor(func) {
    this.requirement = parseArgument(this.rawFunc.toString());
  }

  test(...val) {
    var validator = this.getValidator();
    for (var argumentCounter = 0; argumentCounter < val.length; argumentCounter++) {
      var input = val[argumentCounter];
      var validatorForInput = validator[argumentCounter];
      if (validatorForInput != null) {
        for (
          var validatorCounter = 0;
          validatorCounter < validatorForInput.length;
          validatorCounter++
        ) {
          var validatedResult = validatorForInput[validatorCounter](input);
          if(validatedResult==false) return this.rejectArgument(argumentCounter, validatorCounter);
        }
      }
    }
  }

  getValidator() {
    var featureExec = this.getFeatureExecute();
    var excecuteValidator = [];
    var requirementKeyList = Object.keys(this.requirement);
    for (var i = 0; i < requirementKeyList.length; i++) {
      var argName = requirementKeyList[i];
      excecuteValidator[i] = [];
      var conditionList = this.requirement[argName];
      if (conditionList != null)
        Object.keys(conditionList).forEach(conditionKey => {
          excecuteValidator[argName].push(
            featureExec[conditionKey].bind({
              condition: conditionList[conditionKey]
            })
          );
        });
    }
    return cache(excecuteValidator);
  }

  rejectArgument(argIndex, conditionIndex){
      var argName = Object.keys(this.requirement)[argIndex];
      var condition = this.requirement[argName];
    throw new Error(`Argument ${argName} do not satisfying conditions ${condition}`)
    return false;
  }

  getFeatureExecute() {
    return {
      $size: input => {
        if (typeof this.condition == "string")
          return input.length < this.condition;
        else typeof this.condition == "number";
        return input < this.condition;
      },
      $lt: input => {
        return input < this.condition;
      },
      $lte: input => {
        return input <= this.condition;
      },
      $ne: input => {
        return input != this.condition;
      },
      $gt: input => {
        return input > this.condition;
      },
      $gte: input => {
        return input >= this.condition;
      },
      $ne: input => {
        return input != this.condition;
      },
      $in: input => {
        return condition.contain(input);
      },
      $match: input => {
        return new RegExp(this.condition).test(input);
      },
      $type: input => {
        if (
          typeof this.condition == "function" ||
          (typeof this.condition == "string" &&
            ["string", "number", "object", "boolean"].includes(this.condition))
        ) {
          return input instanceof condition;
        } else if (typeof this.condition == "object") {
          var paramNameList = Object.keys(this.condition);
          for (var i = 0; i < paramNameList.length; i++) {
            var valueKey = paramNameList[i];
            var defaultValue = this.condition[valueKey];
            var insideChecker = this.getFeatureExecute(
              input[valueKey],
              defaultValue
            );
            if (insideChecker == false) return false;
          }
          return true;
        } else throw new Error("Do not support for type : " + condition);
      }
    };
  }
}
