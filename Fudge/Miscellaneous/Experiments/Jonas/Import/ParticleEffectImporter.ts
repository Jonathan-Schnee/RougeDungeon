namespace Import {

  export interface ParticleEffectDefinition {
    // storage?: Storage;
    // storage
    system?: ClosureStorage;
    update?: ClosureStorage;
    particle?: ClosureStorage;

    // transformation
    translation?: ClosureVector;
    rotation?: ClosureVector;
    translationWorld?: ClosureVector;
    scaling?: ClosureVector;
    color?: ClosureColor;
  }

  // export interface Storage {
  //   system?: ClosureStorage;
  //   update?: ClosureStorage;
  //   particle?: ClosureStorage;
  // }

  export interface ClosureStorage {
    [key: string]: Function;
  }

  export interface ClosureVector {
    x?: Function;
    y?: Function;
    z?: Function;
  }

  export interface ClosureColor {
    r?: Function;
    g?: Function;
    b?: Function;
    a?: Function;
  }

  export class ParticleEffectImporter {
    private storedValues: StoredValues;
    private randomNumbers: number[];
    private definition: ParticleEffectDefinition = {};

    constructor(_storedValues: StoredValues, _randomNumbers: number[]) {
      this.storedValues = _storedValues;
      this.randomNumbers = _randomNumbers;
    }

    public importFile(_filename: string): void {
      //TODO: import file
    }

    /**
     * Parse the data from json file and return a particle effect definition
     * @param _data the data to parse
     * @returns a definition of the particle effect containing the closure for translation, rotation etc.
     */
    public parseFile(_data: ParticleEffectData): ParticleEffectDefinition {

      // pre parse storage and initialize stored values
      this.preParseParticleData(_data.system);
      this.preParseParticleData(_data.update);
      this.preParseParticleData(_data.particle);

      // parse storage
      this.definition.system = this.parsePaticleData(_data.system);
      this.definition.update = this.parsePaticleData(_data.update);
      this.definition.particle = this.parsePaticleData(_data.particle);

      // parse translation locale
      this.definition.translation = this.parseVectorData(_data.translation);

      // parse rotation
      this.definition.rotation = this.parseVectorData(_data.rotation);

      // parse translation world
      this.definition.translationWorld = this.parseVectorData(_data.translationWorld);

      // parse scaling
      this.definition.scaling = this.parseVectorData(_data.scaling, 1);

      // parse color
      //TODO: Refactor color and vector because code duplication?
      if (!_data.color)
        _data.color = {};
      this.definition.color = {
        r: this.parseClosure(_data.color.r),
        g: this.parseClosure(_data.color.g),
        b: this.parseClosure(_data.color.b),
        a: this.parseClosure(_data.color.a, 1)
      };

      return this.definition;
    }

    /**
     * Create entries in stored values for each defined storage closure. Predefined values (time, index...) and previously defined ones (in json) can not be overwritten.
     * @param _data The paticle data to parse
     */
    private preParseParticleData(_data: ParticleStorageData): void {
      for (const key in _data) {
        if (key in this.storedValues) {
          // f.Debug.error(`"${key}" is already defined`);
          throw `"${key}" is already defined`;
        }
        else
          this.storedValues[key] = 0;
      }
    }

    /**
     * Parse the given particle storage data, create a closure storage and return it
     * @param _data The storage data to parse
     * @param _closureStorage The closure storage to add to
     */
    private parsePaticleData(_data: ParticleStorageData): ClosureStorage {
      let closureStorage: ClosureStorage = {};
      for (const key in _data) {
        closureStorage[key] = this.parseClosure(_data[key]);
      }
      return closureStorage;
    }

    /**
     * Parse the given paticle vector. If _data is undefined return a closure vector which functions return the given _undefinedValue.
     * @param _data The paticle vector data to parse
     * @param _undefinedValue The number which will be returned by each function if the respective closure data is undefined
     */
    private parseVectorData(_data: ParticleVectorData, _undefinedValue: number = 0): ClosureVector {
      if (!_data) {
        _data = {};
      }
      return {
        x: this.parseClosure(_data.x, _undefinedValue),
        y: this.parseClosure(_data.y, _undefinedValue),
        z: this.parseClosure(_data.z, _undefinedValue)
      };
    }

    /**
     * Parse the given closure data recursivley. If _data is undefined return a function which returns the given _undefinedValue.
     *  e.g. undefined scaling data (x,y,z values) should be set to 1 instead of 0.
     * @param _data The closure data to parse recursively
     * @param _undefinedValue The number which will be returned by the function if _data is undefined
     */
    private parseClosure(_data: ClosureData, _undefinedValue: number = 0): Function {
      switch (typeof _data) {
        case "undefined":
          return () => {
            return _undefinedValue;
          };

        case "object":
          let parameters: Function[] = [];
          for (let param of _data.parameters) {
            parameters.push(this.parseClosure(param));
          }

          // random closure needs to have the random numbers array as a parameter
          if (_data.function == "random") {
            parameters.push(() => {
              return this.randomNumbers;
            });
          }

          let closure: Function = ClosureFactory.getClosure(_data.function, parameters);

          // pre evaluate closure so that only the result will be saved
          // if (_data.preEvaluate) {
          //   f.Debug.log("PreEvaluate");
          //   let result: number = closure();
          //   closure = () => {
          //     f.Debug.log("preEvaluated", result);
          //     return result;
          //   };
          // }
          return closure;

        case "string":
          if (_data in this.storedValues) {
            return () => {
              f.Debug.log("Variable", `"${_data}"`, this.storedValues[<string>_data]);
              return this.storedValues[<string>_data];
            };
          }
          else {
            f.Debug.error(`"${_data}" is not defined`);
            return null;
          }

        case "number":
          return function (): number {
            f.Debug.log("Constant", _data);
            return <number>_data;
          };
      }
    }
  }
}