import { getBalance, ftBalance } from "../../src/near";

describe("near utilities", () => {
  it("getBalance success", async () => {
    expect(await getBalance({ accountId: "max-normal.near" })).toBeDefined();
  });

  it("getBalance fail", async () => {
    await expect(() => getBalance({ accountId: "zebra" })).toThrow();
  });

  it("ftBalance success", async () => {
    expect(
      await ftBalance({
        accountId: "max-normal.near",
        contractId: "wrap.near",
      }),
    ).toBeDefined();
  });

  it("ftBalance zero", async () => {
    expect(
      await ftBalance({ accountId: "zebra", contractId: "wrap.near" }),
    ).toBe("0");
  });

  it("ftBalance fail", async () => {
    await expect(() =>
      ftBalance({ accountId: "wrap.near", contractId: "zebra" }),
    ).toThrow();
  });
});
