import { themeQuartz } from "ag-grid-community";
import "../styles/data-grid.css";
export const portalGridTheme = themeQuartz.withParams({
  accentColor: "#38a34a", borderRadius: 10, wrapperBorderRadius: 0, wrapperBorder: false,
  spacing: 8, headerHeight: 48, rowHeight: 72, fontFamily: '"Segoe UI", sans-serif', fontSize: 13,
  borderColor: "#dce5dc", headerBackgroundColor: "#f5f8f4", headerTextColor: "#475569", headerFontWeight: 600,
  oddRowBackgroundColor: "#fbfdfb", rowHoverColor: "#edf7ee", selectedRowBackgroundColor: "#e8f5e9",
  cellHorizontalPadding: 16, browserColorScheme: "light",
});
export const portalGridLocale = { page: "Página", of: "de", to: "a", next: "Próxima", last: "Última", first: "Primeira", previous: "Anterior", pageSizeSelectorLabel: "Itens por página:", contains: "Contém", notContains: "Não contém", equals: "Igual a", notEqual: "Diferente de", startsWith: "Começa com", endsWith: "Termina com", blank: "Em branco", notBlank: "Preenchido", filterOoo: "Filtrar...", dateFormatOoo: "dd/mm/aaaa", before: "Antes de", after: "Depois de", inRange: "Entre", andCondition: "E", orCondition: "OU", applyFilter: "Aplicar", resetFilter: "Limpar", clearFilter: "Limpar", cancelFilter: "Cancelar" };
