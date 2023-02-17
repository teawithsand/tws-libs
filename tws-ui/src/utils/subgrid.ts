import { css } from "styled-components"

export type SubgridHelperOptions = {
	/**
	 * Rows of grid to use; ignored when empty
	 */
	rows?: string[]

	/**
	 * Columns of grid to use; ignored when empty
	 */
	cols?: string[]

	/**
	 * Default rows to use; ignored when rows is not empty or when value is empty
	 */
	defaultRows?: string[]

	/**
	 * Default columns to use; ignored when cols is not empty or when value is empty
	 */
	defaultCols?: string[]
}

/**
 * Helper, that makes making CSS grid subgrids easier.
 *
 * It generates styles for subgrid and polyfills for browsers that do not support subgrid.
 *
 * Note #1: it's programmers responsibility to set `display: grid;`
 * Note #2: if sending gap in parent, it's programmers responsibility to unset/reset it in child using say `gap: 0;`
 */
export class SubgridHelper {
	constructor(private readonly options: SubgridHelperOptions) {}

	get cols() {
		return this.options.cols || []
	}
	get rows() {
		return this.options.rows || []
	}
	get defaultRows() {
		return this.options.defaultRows || []
	}
	get defaultCols() {
		return this.options.defaultCols || []
	}

	get parentCss() {
		let colDef: any = ""

		{
			if (this.cols.length) {
				colDef = css`
					grid-template-columns: ${this.cols.join(" ")};
				`
			} else if (this.defaultCols.length) {
				colDef = css`
					grid-template-columns: ${this.defaultCols.join(" ")};
				`
			}
		}

		let rowDef: any = ""

		{
			if (this.rows.length) {
				rowDef = css`
					grid-template-rows: ${this.rows.join(" ")};
				`
			} else if (this.defaultRows.length) {
				rowDef = css`
					grid-template-rows: ${this.defaultRows.join(" ")};
				`
			}
		}

		return css`
			${rowDef}
			${colDef}
		`
	}

	get childCss() {
		let colDef: any = ""

		{
			if (this.cols.length) {
				colDef = css`
					grid-template-columns: ${this.cols.join(" ")};
					grid-template-columns: subgrid;
					grid-column: span ${this.cols.length};
				`
			} else if (this.defaultCols.length) {
				colDef = css`
					grid-template-columns: ${this.defaultCols.join(" ")};
				`
			}
		}

		let rowDef: any = ""

		{
			if (this.rows.length) {
				rowDef = css`
					grid-template-rows: ${this.rows.join(" ")};
					grid-template-rows: subgrid;
					grid-column: span ${this.rows.length};
				`
			} else if (this.defaultRows.length) {
				rowDef = css`
					grid-template-rows: ${this.defaultRows.join(" ")};
				`
			}
		}

		return css`
			${rowDef}
			${colDef}
		`
	}
}
