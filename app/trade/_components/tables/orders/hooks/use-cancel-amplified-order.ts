import { MangroveAmplifier } from "@mangrovedao/mangrove.js"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import useMangrove from "@/providers/mangrove"
import { useLoadingStore } from "@/stores/loading.store"
import type { AmplifiedOrder } from "../schema"

type Props = {
  offerId?: string
  onCancel?: () => void
}

export function useCancelAmplifiedOrder({ offerId, onCancel }: Props = {}) {
  const queryClient = useQueryClient()
  const resolveWhenBlockIsIndexed = useResolveWhenBlockIsIndexed()
  const [startLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])
  const { mangrove } = useMangrove()

  return useMutation({
    /*
     * We introduce a mutationKey to the useCancelOrder hook. This allows us to
     * handle multiple order retractions simultaneously, without them sharing the
     * same mutation state. This is crucial for maintaining independent states
     * for each retraction operation.
     */
    mutationKey: ["retractOrder", offerId],
    mutationFn: async ({ order }: { order: AmplifiedOrder }) => {
      try {
        const sendToken = order.offers[0]?.market.outbound_tkn

        if (!sendToken || !mangrove) return
        const amp = new MangroveAmplifier({ mgv: mangrove })

        const retract = await amp.retractBundle({
          bundleId: order.bundleId,
          outboundToken: sendToken,
        })

        return retract
        // order id = 0xbf16533e50a352c47615fee34574df2b30fdc4a8243a3d8194630a2a5d63d176-0x3b
      } catch (error) {
        console.error(error)
        throw new Error("")
      }
    },
    onSuccess: async (data) => {
      onCancel?.()
      try {
        startLoading(TRADE.TABLES.ORDERS)
        // const { blockNumber } = await (await retract.response).wait()
        // await resolveWhenBlockIsIndexed.mutateAsync({
        //   blockNumber,
        // })
        queryClient.invalidateQueries({ queryKey: ["orders"] })
        queryClient.invalidateQueries({ queryKey: ["fills"] })
        queryClient.invalidateQueries({ queryKey: ["amplified"] })
      } catch (error) {
        console.error(error)
      }
    },
    meta: {
      error: `Failed to retract the amplified orders`,
      success: `The amplified orders has been successfully retracted`,
    },
  })
}
