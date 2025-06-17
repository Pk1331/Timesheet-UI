import React, { useState } from "react"
import { Button, Menu, MenuItem } from "@mui/material"
import { CSVLink } from "react-csv"
import { FaFileExcel, FaDownload, FaFileCsv } from "react-icons/fa"

const DownloadDropdown = ({ filename, csvData, onExcelDownload }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <div style={{ textAlign: "right", marginBottom: "1rem" }}>
      {/* Download Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleClick}
        endIcon={<FaDownload />}
      >
        Download
      </Button>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            minWidth: "180px",
          },
        }}
      >
        {/* Excel Option */}
        <MenuItem
          onClick={() => {
            onExcelDownload()
            handleClose()
          }}
        >
          <FaFileExcel style={{ marginRight: "10px", color: "green" }} />
          Download Excel
        </MenuItem>

        {/* CSV Option */}
        <MenuItem onClick={handleClose}>
          <CSVLink
            data={csvData}
            filename={filename}
            style={{
              color: "inherit",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FaFileCsv style={{ marginRight: "10px", color: "blue" }} />
            Download CSV
          </CSVLink>
        </MenuItem>
      </Menu>
    </div>
  )
}

export default DownloadDropdown
