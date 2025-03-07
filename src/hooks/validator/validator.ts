import { FieldValues } from 'react-hook-form';

import { Contract, ContractColumn, ContractField, ContractRow, ContractTabs } from '@types';

function validateFields<FormValue extends FieldValues>({
  fields,
  allowedComponents,
}: {
  fields?: ContractField<FormValue>[];
  allowedComponents: string[];
}): string[] {
  return (
    fields?.reduce<string[]>((ids, field) => {
      if (!field.id) {
        throw new Error('Field id is required');
      } else if (!/^[A-Za-z0-9_]+$/.test(field.id)) {
        throw new Error('Field id must not contain special characters or spaces');
      } else if (!field.component) {
        throw new Error('Field component is required');
      } else if (!allowedComponents.includes(field.component)) {
        throw new Error(`Component '${field.component}' is not allowed`);
      } else if (field.debounceWait) {
        throw new Error('Field dont have debounceWait');
      }
      return [...ids, field.id as string];
    }, []) ?? []
  );
}

function validateRows<FormValue extends FieldValues>({
  rows,
  allowedComponents,
}: {
  rows?: ContractRow<FormValue>[];
  allowedComponents: string[];
}): string[] {
  return (
    rows?.reduce<string[]>((ids, row) => {
      const rv = [row.fields, row.rows, row.columns].filter(Boolean);
      if (rv.length > 1) {
        throw new Error('Rows can only have fields or rows or columns');
      }
      const fieldsIds = validateFields({
        fields: row.fields,
        allowedComponents,
      });
      const rowsIds = validateRows({
        rows: row.rows,
        allowedComponents,
      });
      const columnsIds = validateColumns({
        columns: row.columns,
        allowedComponents,
      });

      return [...ids, ...fieldsIds, ...rowsIds, ...columnsIds];
    }, []) ?? []
  );
}

function validateColumns<FormValue extends FieldValues>({
  columns,
  allowedComponents,
}: {
  columns?: ContractColumn<FormValue>[];
  allowedComponents: string[];
}): string[] {
  return (
    columns?.reduce<string[]>((ids, column) => {
      const rv = [column.fields, column.rows, column.columns].filter(Boolean);
      if (rv.length > 1) {
        throw new Error('Columns can only have fields or rows or columns');
      }
      const fieldsIds = validateFields({
        fields: column.fields,
        allowedComponents,
      });
      const rowsIds = validateRows({
        rows: column.rows,
        allowedComponents,
      });
      const columnsIds = validateColumns({
        columns: column.columns,
        allowedComponents,
      });

      return [...ids, ...fieldsIds, ...rowsIds, ...columnsIds];
    }, []) ?? []
  );
}

function validateTabs<FormValue extends FieldValues>({
  tabs,
  allowedComponents,
}: {
  tabs?: ContractTabs<FormValue>[];
  allowedComponents: string[];
}): string[] {
  return (
    tabs?.reduce<string[]>((ids, tab) => {
      const rv = [tab.fields, tab.rows, tab.columns].filter(Boolean);
      if (rv.length > 1) {
        throw new Error('Tabs can only have fields or rows or columns');
      }
      const fieldsIds = validateFields({
        fields: tab.fields,
        allowedComponents,
      });
      const rowsIds = validateRows({
        rows: tab.rows,
        allowedComponents,
      });
      const columnsIds = validateColumns({
        columns: tab.columns,
        allowedComponents,
      });

      return [...ids, ...fieldsIds, ...rowsIds, ...columnsIds];
    }, []) ?? []
  );
}

function validateContract<FormValue extends FieldValues>({
  contract,
  allowedComponents,
}: {
  contract: Contract<FormValue>;
  allowedComponents: string[];
}): void {
  const v = [contract.rows, contract.columns, contract.tab].filter(Boolean);
  if (v.length > 1) {
    throw new Error('Contract can only have rows or columns or tabs');
  }
  const rowsIds = validateRows({ rows: contract.rows, allowedComponents });
  const columnsIds = validateColumns({
    columns: contract.columns,
    allowedComponents,
  });
  const tabsIds = validateTabs({ tabs: contract.tab?.tabs, allowedComponents });

  const ids = [...rowsIds, ...columnsIds, ...tabsIds];

  ids.forEach((id) => {
    const equals = ids.filter((eq) => eq === id);
    if (!equals || equals.length > 1) {
      throw new Error(`id '${id}' is duplicated`);
    }
  });
}

export { validateContract };
