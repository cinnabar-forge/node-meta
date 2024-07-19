import { expect } from "chai";
import {
  parseVersion,
  updateVersion,
  updatePrerelease,
  markBuild,
} from "../src/version.js";

describe("Version Management", function () {
  describe("parseVersion()", function () {
    it("should correctly parse a simple version string", function () {
      const result = parseVersion("1.2.3");
      expect(result).to.deep.equal({
        major: 1,
        minor: 2,
        patch: 3,
        prerelease: undefined,
        prereleaseNumber: undefined,
      });
    });

    it("should correctly parse a full version string with prerelease", function () {
      const result = parseVersion("1.2.3-alpha.4");
      expect(result).to.deep.equal({
        major: 1,
        minor: 2,
        patch: 3,
        prerelease: "alpha",
        prereleaseNumber: 4,
      });
    });

    it("should handle 'next' as undefined prerelease", function () {
      const result = parseVersion("1.2.3-next");
      expect(result.prerelease).to.be.undefined;
      expect(result.prereleaseNumber).to.be.undefined;
    });
  });

  describe("updateVersion()", function () {
    it("should correctly update major version", function () {
      const result = updateVersion({ major: 1, minor: 2, patch: 3 }, "major");
      expect(result).to.equal("2.0.0");
    });

    it("should correctly update minor version", function () {
      const result = updateVersion({ major: 1, minor: 2, patch: 3 }, "minor");
      expect(result).to.equal("1.3.0");
    });

    it("should correctly update patch version", function () {
      const result = updateVersion({ major: 1, minor: 2, patch: 3 }, "patch");
      expect(result).to.equal("1.2.4");
    });
  });

  describe("updatePrerelease()", function () {
    it("should add a number to the prerelease tag", function () {
      const result = updatePrerelease(
        {
          major: 1,
          minor: 2,
          patch: 3,
          prerelease: "alpha",
        },
        "alpha",
      );
      expect(result).to.include("alpha.1");
    });

    it("should increment an existing prerelease number", function () {
      const result = updatePrerelease(
        {
          major: 1,
          minor: 2,
          patch: 3,
          prerelease: "alpha",
          prereleaseNumber: 1,
        },
        "alpha",
      );
      expect(result).to.include("alpha.2");
    });
  });

  describe("markBuild()", function () {
    it("should append the build version correctly", function () {
      const result = markBuild({ major: 1, minor: 2, patch: 3 });
      expect(result).to.match(/\d+\.\d+\.\d+-next\.\d{8}\d{6}/);
    });
  });
});
