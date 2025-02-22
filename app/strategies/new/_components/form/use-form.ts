import React from "react"
import { useDebounce } from "usehooks-ts"
import { useAccount, useBalance } from "wagmi"

import { useTokenBalance } from "@/hooks/use-token-balance"
import useMarket from "@/providers/market"
import { getErrorMessage } from "@/utils/errors"
import { useKandelRequirements } from "../../_hooks/use-kandel-requirements"
import { ChangingFrom, useNewStratStore } from "../../_stores/new-strat.store"

export const MIN_PRICE_POINTS = 2
export const MIN_RATIO = 1.001
export const MIN_STEP_SIZE = 1

export default function useForm() {
  const { address } = useAccount()

  const { market } = useMarket()
  const baseToken = market?.base
  const quoteToken = market?.quote
  const baseBalance = useTokenBalance(baseToken)
  const quoteBalance = useTokenBalance(quoteToken)
  const { data: nativeBalance } = useBalance({
    address,
  })

  const {
    priceRange: [minPrice, maxPrice],
    setGlobalError,
    errors,
    setErrors,
    baseDeposit,
    quoteDeposit,
    pricePoints,
    ratio,
    stepSize,
    bountyDeposit,
    setBaseDeposit,
    setQuoteDeposit,
    setPricePoints,
    setRatio,
    setStepSize,
    setBountyDeposit,
    isChangingFrom,
    setIsChangingFrom,
    setDistribution,
  } = useNewStratStore()
  const debouncedStepSize = useDebounce(stepSize, 300)
  const debouncedPricePoints = useDebounce(pricePoints, 300)
  const fieldsDisabled = !(minPrice && maxPrice)

  const kandelRequirementsQuery = useKandelRequirements({
    onAave: false,
    minPrice,
    maxPrice,
    stepSize: debouncedStepSize,
    pricePoints: debouncedPricePoints,
    ratio,
    isChangingFrom,
  })

  const {
    requiredBase,
    requiredQuote,
    requiredBounty,
    offersWithPrices,
    priceRatio,
    pricePoints: points,
    distribution,
  } = kandelRequirementsQuery.data || {}

  // I need the distribution to be set in the store to share it with the price range component
  React.useEffect(() => {
    setDistribution(distribution)
  }, [distribution])

  const setOffersWithPrices = useNewStratStore(
    (store) => store.setOffersWithPrices,
  )

  // if kandelRequirementsQuery has error
  React.useEffect(() => {
    if (kandelRequirementsQuery.error) {
      setGlobalError(getErrorMessage(kandelRequirementsQuery.error))
      return
    }
    setGlobalError(undefined)
  }, [kandelRequirementsQuery.error])

  // Update ratio field if number of price points is changing
  React.useEffect(() => {
    if (isChangingFrom === "ratio" || !priceRatio) return
    setRatio(priceRatio.toFixed(4))
  }, [priceRatio])

  React.useEffect(() => {
    if (
      isChangingFrom === "pricePoints" ||
      !points ||
      Number(pricePoints) === points
    )
      return
    setPricePoints(points.toString())
  }, [points])

  React.useEffect(() => {
    setOffersWithPrices(offersWithPrices)
  }, [offersWithPrices])

  const handleFieldChange = (field: ChangingFrom) => {
    setIsChangingFrom(field)
  }

  const handleBaseDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("baseDeposit")
    const value = typeof e === "string" ? e : e.target.value
    setBaseDeposit(value)
  }

  const handleQuoteDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("quoteDeposit")
    const value = typeof e === "string" ? e : e.target.value
    setQuoteDeposit(value)
  }

  const handlePricePointsChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("pricePoints")
    const value = typeof e === "string" ? e : e.target.value
    setPricePoints(value)
  }

  const handleRatioChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("ratio")
    const value = typeof e === "string" ? e : e.target.value
    setRatio(value)
  }

  const handleStepSizeChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("stepSize")
    const value = typeof e === "string" ? e : e.target.value
    setStepSize(value)
  }

  const handleBountyDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("bountyDeposit")
    const value = typeof e === "string" ? e : e.target.value
    setBountyDeposit(value)
  }

  React.useEffect(() => {
    const newErrors = { ...errors }

    // Base Deposit Validation
    if (Number(baseDeposit) > Number(baseBalance.formatted) && baseDeposit) {
      newErrors.baseDeposit =
        "Base deposit cannot be greater than wallet balance"
    } else if (requiredBase?.gt(0) && Number(baseDeposit) === 0) {
      newErrors.baseDeposit = "Base deposit must be greater than 0"
    } else {
      delete newErrors.baseDeposit
    }

    // Quote Deposit Validation
    if (Number(quoteDeposit) > Number(quoteBalance.formatted) && quoteDeposit) {
      newErrors.quoteDeposit =
        "Quote deposit cannot be greater than wallet balance"
    } else if (requiredQuote?.gt(0) && Number(quoteDeposit) === 0) {
      newErrors.quoteDeposit = "Quote deposit must be greater than 0"
    } else {
      delete newErrors.quoteDeposit
    }

    if (Number(pricePoints) < Number(MIN_PRICE_POINTS) && pricePoints) {
      newErrors.pricePoints = "Price points must be at least 2"
    } else {
      delete newErrors.pricePoints
    }

    if (Number(ratio) < Number(MIN_RATIO) && ratio) {
      newErrors.ratio = "Ratio must be at least 1.001"
    } else {
      delete newErrors.ratio
    }

    if (
      (Number(stepSize) < Number(MIN_STEP_SIZE) ||
        Number(stepSize) >= Number(pricePoints)) &&
      stepSize
    ) {
      newErrors.stepSize =
        "Step size must be at least 1 and inferior to price points"
    } else {
      delete newErrors.stepSize
    }

    if (
      Number(bountyDeposit) > Number(nativeBalance?.formatted) &&
      bountyDeposit
    ) {
      newErrors.bountyDeposit =
        "Bounty deposit cannot be greater than wallet balance"
    } else if (requiredBounty?.gt(0) && Number(bountyDeposit) === 0) {
      newErrors.bountyDeposit = "Bounty deposit must be greater than 0"
    } else {
      delete newErrors.bountyDeposit
    }

    setErrors(newErrors)
  }, [
    baseDeposit,
    quoteDeposit,
    pricePoints,
    ratio,
    stepSize,
    bountyDeposit,
    requiredBase,
    requiredQuote,
  ])

  return {
    baseToken,
    quoteToken,
    requiredBase,
    requiredQuote,
    requiredBounty,
    isChangingFrom,
    pricePoints,
    baseDeposit,
    quoteDeposit,
    handleBaseDepositChange,
    handleQuoteDepositChange,
    handlePricePointsChange,
    fieldsDisabled,
    errors,
    kandelRequirementsQuery,
    ratio,
    handleRatioChange,
    stepSize,
    handleStepSizeChange,
    nativeBalance,
    bountyDeposit,
    handleBountyDepositChange,
  }
}
