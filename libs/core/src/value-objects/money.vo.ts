import { ValueObject } from '../base/value-object.base';
import { AppError } from '../shared/app-error';
import { Result } from '@razworks/shared-utils'; // ✅ FIX

export type Currency = 'USD' | 'BRL' | 'EUR';

interface MoneyProps {
  amount: number;
  currency: Currency;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super({ value: props });
  }

  public static create(amount: number, currency: Currency): Result<Money, AppError.ValidationError> {
    if (!Number.isInteger(amount)) {
      return Result.fail(new AppError.ValidationError('Money amount must be an integer (cents).'));
    }
    if (amount < 0) {
        return Result.fail(new AppError.ValidationError('Money amount cannot be negative.'));
    }
    return Result.ok(new Money({ amount, currency }));
  }

  public add(other: Money): Result<Money, AppError.ValidationError> {
    if (this.props.value.currency !== other.props.value.currency) {
      return Result.fail(new AppError.ValidationError('Cannot add money with different currencies.'));
    }
    return Money.create(this.props.value.amount + other.props.value.amount, this.props.value.currency);
  }

  public get amount(): number { return this.props.value.amount; }
  public get currency(): Currency { return this.props.value.currency; }
  public get formatted(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.props.value.currency
    }).format(this.props.value.amount / 100);
  }
}
