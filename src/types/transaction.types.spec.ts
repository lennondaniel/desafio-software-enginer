import { isDeposit, isTransfer, isWithdraw } from "./transaction.types"

describe('Transaction Type guards', () => {
    it('should correctly identify a deposit transaction', () => {
        expect(isDeposit('deposit')).toBe(true)
        expect(isDeposit('withdraw')).toBe(false)
        expect(isDeposit('transfer')).toBe(false)
    })

    it('should correctly identify a withdraw transaction', () => {
        expect(isWithdraw('withdraw')).toBe(true)
        expect(isWithdraw('deposit')).toBe(false)
        expect(isWithdraw('transfer')).toBe(false)
    })

    it('should correctly identify a transfer transaction', () => {
        expect(isTransfer('transfer')).toBe(true)
        expect(isTransfer('deposit')).toBe(false)
        expect(isTransfer('withdraw')).toBe(false)
    })
})