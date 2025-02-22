import { env } from "@/env.mjs"
import * as wagmiChains from "wagmi/chains"
import { type Chain } from "wagmi/chains"

const WHITELISTED_CHAIN_IDS = env.NEXT_PUBLIC_WHITELISTED_CHAIN_IDS
const DEFAULT_CHAIN_ID = "80001"
const CHAIN_IDS = WHITELISTED_CHAIN_IDS
  ? WHITELISTED_CHAIN_IDS.includes(",")
    ? WHITELISTED_CHAIN_IDS.split(",")
    : [WHITELISTED_CHAIN_IDS]
  : [DEFAULT_CHAIN_ID]

type WagmiChains = Record<string, Chain>

export function getWhitelistedChainObjects() {
  const result = []
  for (const chainName in wagmiChains) {
    const chainObject = (wagmiChains as WagmiChains)[chainName]
    if (chainObject && CHAIN_IDS.includes(chainObject.id.toString())) {
      result.push(chainObject)
    }
  }
  return renameChainNames(result)
}

export function getChainObjectById(chainId: string): Chain | undefined {
  for (const chainName in wagmiChains) {
    const chainObject: Chain | undefined = (wagmiChains as WagmiChains)[
      chainName
    ]
    if (chainObject?.id.toString() === chainId) {
      return chainObject
    }
  }

  // return undefined if no matching chain is found
  return undefined
}

function renameChainNames(chains: wagmiChains.Chain[]) {
  return chains.map((chain) => {
    if (chain.id === wagmiChains.polygonMumbai.id) {
      return { ...chain, name: "Mumbai" }
    }

    if (chain.id === wagmiChains.blastSepolia.id) {
      return {
        ...wagmiChains.blastSepolia,
        iconUrl:
          "https://cdn.routescan.io/_next/image?url=https%3A%2F%2Fcms-cdn.avascan.com%2Fcms2%2Fblast.dead36673539.png&w=48&q=100",
      }
    }
    return chain
  })
}
