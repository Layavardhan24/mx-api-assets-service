const { getGithubPath, resolveParams, networkMap } = require("../../../libs/common/src/assets-cdn/utils/path-resolver.utils")

describe("Core Functionality Tests", () => {
  describe("Network Mapping Logic", () => {
    it("should correctly map all known networks", () => {
      expect(networkMap.mainnet).toBe("")
      expect(networkMap.devnet).toBe("devnet")
      expect(networkMap.testnet).toBe("testnet")
      expect(networkMap["local-devnet"]).toBe("local-devnet")
    })

    it("should handle unknown networks as undefined in networkMap", () => {
      expect(networkMap["invalid-network"]).toBeUndefined()
    })
  })

  describe("Asset Type Formatting", () => {
    it("should use .json extension for accounts directly", () => {
      const path = getGithubPath("mainnet", "accounts", "erd1abc")
      expect(path).toBe("accounts/erd1abc.json")
    })

    it("should use info.json subfolder for tokens", () => {
      const path = getGithubPath("mainnet", "tokens", "TOKEN-123")
      expect(path).toBe("tokens/TOKEN-123/info.json")
    })

    it("should use info.json subfolder for identities", () => {
      const path = getGithubPath("mainnet", "identities", "my-id")
      expect(path).toBe("identities/my-id/info.json")
    })

    it("should map local-devnet to local-devnet github path", () => {
      const path = getGithubPath("local-devnet", "tokens", "TOKEN-123")
      expect(path).toBe("local-devnet/tokens/TOKEN-123/info.json")
    })
  })

  describe("Resolution Edge Cases", () => {
    it("should handle missing optional parameters in resolveParams", () => {
      const result = resolveParams({ p1: "tokens", p2: "EGLD-123" })
      expect(result).toEqual({
        network: "mainnet",
        type: "tokens",
        id: "EGLD-123"
      })
    })

    it("should prioritize explicit network if provided in p1", () => {
      const result = resolveParams({ p1: "testnet", p2: "tokens", p3: "TEST-1" })
      expect(result).toEqual({
        network: "testnet",
        type: "tokens",
        id: "TEST-1"
      })
    })

    it("should recognize local-devnet as explicit network in p1", () => {
      const result = resolveParams({ p1: "local-devnet", p2: "tokens", p3: "LOCAL-1" })
      expect(result).toEqual({
        network: "local-devnet",
        type: "tokens",
        id: "LOCAL-1"
      })
    })
  })

  describe("NetworkPipe Validation", () => {
    const { NetworkPipe } = require("../../../apps/api/src/endpoints/assets-cdn/pipes/network.pipe")
    const pipe = new NetworkPipe()

    it("should accept valid networks including local-devnet", () => {
      expect(pipe.transform("mainnet")).toBe("mainnet")
      expect(pipe.transform("testnet")).toBe("testnet")
      expect(pipe.transform("devnet")).toBe("devnet")
      expect(pipe.transform("local-devnet")).toBe("local-devnet")
      expect(pipe.transform("LOCAL-DEVNET")).toBe("local-devnet")
    })

    it("should reject invalid networks", () => {
      expect(() => pipe.transform("custom-net")).toThrow()
    })
  })

  describe("NetworkConfigService Chain ID", () => {
    let mockNetwork = "mainnet"

    beforeAll(() => {
      jest.doMock("../../../libs/common/src/config/configuration", () => ({
        configuration: () => ({
          libs: {
            common: {
              network: mockNetwork,
            },
          },
        }),
      }))
    })

    afterAll(() => {
      jest.dontMock("../../../libs/common/src/config/configuration")
    })

    it("should return chainID 'L' for local-devnet", () => {
      mockNetwork = "local-devnet"
      const { NetworkConfigService } = require("../../../libs/common/src/config/network.config.service")
      const service = new NetworkConfigService()
      const config = service.getNetworkConfig()
      expect(config).toBeDefined()
      expect(config.chainID).toBe("L")
      expect(service.config.chainID).toBe("L")
    })

    it("should return correct chainIDs for devnet, testnet, mainnet", () => {
      const { NetworkConfigService } = require("../../../libs/common/src/config/network.config.service")

      mockNetwork = "devnet"
      expect(new NetworkConfigService().config.chainID).toBe("D")

      mockNetwork = "testnet"
      expect(new NetworkConfigService().config.chainID).toBe("T")

      mockNetwork = "mainnet"
      expect(new NetworkConfigService().config.chainID).toBe("1")
    })
  })
})
