import { Module } from '@nestjs/common';
import { HomeModule } from './home/home.module';
import { ClientModule } from './person/client/src/client.module';
import { SupplierModule } from './person/supplier/src/supplier.module';
import { EmployeeModule } from './person/employee/src/employee.module';
import { ProductModule } from './product/product/src/product.module';
import { CategoryModule } from './product/category/src/category.module';
import { SubCategoryModule } from './product/sub-category/src/sub-category.module';
import { AccountsPayableModule } from './finance/accounts-payable/src/accounts-payable.module';
import { AccountsReceivableModule } from './finance/accounts-receivable/src/accounts-receivable.module';
import { BankAccountsModule } from './finance/bank-accounts/src/bank-accounts.module';
import { BanksModule } from './finance/banks/src/banks.module';
import { CashFlowModule } from './finance/cash-flow/src/cash-flow.module';
import { PaymentMethodsModule } from './finance/payment-methods/src/payment-methods.module';
import { TreasuryModule } from './finance/treasury/src/treasury.module';
import { InventoryControlModule } from './inventory-control/src/inventory-control.module';
import { TransporterModule } from './person/transporter/src/transporter.module';
import { ProcurementModule } from './procurement/src/procurement.module';
import { SalesModule } from './sales/src/sales.module';
import { TaxManagementModule } from './tax-management/src/tax-management.module';

@Module({
  imports: [
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
