import { z } from "zod"

export const orderSchema = z.object({
  creationDate: z.string(),
  latestUpdateDate: z.string(),
  expiryDate: z.string().optional(),
  transactionHash: z.string(),
  isBid: z.boolean(),
  takerGot: z.string(),
  takerGave: z.string(),
  penalty: z.string(),
  feePaid: z.string(),
  initialWants: z.string(),
  initialGives: z.string(),
  price: z.string(),
  offerId: z.string(),
})
export type Order = z.infer<typeof orderSchema>

export function parseOrders(data: unknown[]): Order[] {
  return data
    .map((item) => {
      try {
        return orderSchema.parse(item)
      } catch (error) {
        console.error("Invalid format offers: ", item, error)
        return null
      }
    })
    .filter(Boolean) as Order[]
}
