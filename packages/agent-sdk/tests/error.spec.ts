import { errorString } from "../src/error";

describe("errorString(unknown)", () => {
  it("returns generic message on nullish error", async () => {
    expect(errorString(null)).toBe("unknown error: null");
    expect(errorString(undefined)).toBe("unknown error: undefined");
  });

  it("returns exact string on string error", async () => {
    const message = "error message";
    expect(errorString(message)).toBe(message);
  });

  it("returns stringified json on object", async () => {
    const obj = { field: "value" };
    expect(errorString(obj)).toBe(JSON.stringify(obj));
  });

  it("returns Error.message Error instance", async () => {
    const message = "error message";
    const err = new Error(message);
    expect(errorString(err)).toBe(message);
  });
});
