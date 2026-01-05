import { Module } from '@nestjs/common';
import { HomeModule } from './modules/home/home.module';
import { ClientModule } from './modules/person/client/src/client.module';
import { SupplierModule } from './modules/person/supplier/src/supplier.module';
import { EmployeeModule } from './modules/person/employee/src/employee.module';
import { ProductModule } from './modules/product/product/src/product.module';
import { CategoryModule } from './modules/product/category/src/category.module';
import { SubCategoryModule } from './modules/product/sub-category/src/sub-category.module';
import { AccountsPayableModule } from './modules/finance/accounts-payable/src/accounts-payable.module';
import { AccountsReceivableModule } from './modules/finance/accounts-receivable/src/accounts-receivable.module';
import { BankAccountsModule } from './modules/finance/bank-accounts/src/bank-accounts.module';
import { BanksModule } from './modules/finance/banks/src/banks.module';
import { CashFlowModule } from './modules/finance/cash-flow/src/cash-flow.module';
import { PaymentMethodsModule } from './modules/finance/payment-methods/src/payment-methods.module';
import { TreasuryModule } from './modules/finance/treasury/src/treasury.module';
import { InventoryControlModule } from './modules/inventory-control/src/inventory-control.module';
import { TransporterModule } from './modules/person/transporter/src/transporter.module';
import { ProcurementModule } from './modules/procurement/src/procurement.module';
import { SalesModule } from './modules/sales/src/sales.module';
import { TaxManagementModule } from './modules/tax-management/src/tax-management.module';
import { AuthModule } from './modules/shared/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    HomeModule,
    AccountsPayableModule,
    AccountsReceivableModule,
    BankAccountsModule,
    BanksModule,
    CashFlowModule,
    PaymentMethodsModule,
    TreasuryModule,
    InventoryControlModule,
    ClientModule,
    EmployeeModule,
    SupplierModule,
    TransporterModule,
    ProcurementModule,
    ProductModule,
    CategoryModule,
    SubCategoryModule,
    SalesModule,
    TaxManagementModule,
  ],
})
export class AppModule {}
