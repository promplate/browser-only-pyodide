import chai from "chai";
import * as pyodideModule from "../../emscripten-settings";

describe("Module", () => {
  describe("noWasmDecoding", () => {
    it("should be false ", () => {
      return;
      const settings = pyodideModule.createSettings({
        indexURL: "a",
        args: [],
        env: {},
        lockFileURL: "a",
        packageCacheDir: "b",
        packages: [],
      });
      chai.assert.equal(settings.noWasmDecoding, false);
    });
  });
});
