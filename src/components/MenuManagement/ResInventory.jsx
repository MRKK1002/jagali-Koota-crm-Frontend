// "use client"

// import { useState } from "react"

// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Input } from "@/components/ui/input"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"

// const formatDate = (date) => {
//   return date.toISOString().split("T")[0]
// }

// // Sample data for categories and inventory
// const categories = ["Beverages", "Appetizers", "Main Course", "Desserts", "Sides", "Salads", "Soups", "Snacks"]

// const initialInventory = [
//   { id: 1, category: "Beverages", item: "Cola", produced: 100, sold: 60, balance: 40 },
//   { id: 2, category: "Appetizers", item: "Spring Rolls", produced: 50, sold: 30, balance: 20 },
//   { id: 3, category: "Main Course", item: "Butter Chicken", produced: 80, sold: 50, balance: 30 },
//   { id: 4, category: "Desserts", item: "Gulab Jamun", produced: 40, sold: 25, balance: 15 },
//   { id: 5, category: "Sides", item: "Naan", produced: 120, sold: 100, balance: 20 },
//   { id: 6, category: "Beverages", item: "Fresh Orange Juice", produced: 75, sold: 65, balance: 10 },
//   { id: 7, category: "Beverages", item: "Iced Tea", produced: 90, sold: 45, balance: 45 },
//   { id: 8, category: "Appetizers", item: "Chicken Wings", produced: 60, sold: 55, balance: 5 },
//   { id: 9, category: "Appetizers", item: "Mozzarella Sticks", produced: 45, sold: 30, balance: 15 },
//   { id: 10, category: "Main Course", item: "Grilled Salmon", produced: 35, sold: 28, balance: 7 },
//   { id: 11, category: "Main Course", item: "Beef Steak", produced: 25, sold: 20, balance: 5 },
//   { id: 12, category: "Main Course", item: "Vegetable Curry", produced: 70, sold: 45, balance: 25 },
//   { id: 13, category: "Desserts", item: "Chocolate Cake", produced: 30, sold: 25, balance: 5 },
//   { id: 14, category: "Desserts", item: "Ice Cream", produced: 50, sold: 40, balance: 10 },
//   { id: 15, category: "Sides", item: "French Fries", produced: 150, sold: 130, balance: 20 },
//   { id: 16, category: "Sides", item: "Garlic Bread", produced: 80, sold: 70, balance: 10 },
//   { id: 17, category: "Salads", item: "Caesar Salad", produced: 40, sold: 35, balance: 5 },
//   { id: 18, category: "Salads", item: "Greek Salad", produced: 35, sold: 25, balance: 10 },
//   { id: 19, category: "Soups", item: "Tomato Soup", produced: 60, sold: 50, balance: 10 },
//   { id: 20, category: "Soups", item: "Chicken Soup", produced: 55, sold: 40, balance: 15 },
//   { id: 21, category: "Snacks", item: "Nachos", produced: 45, sold: 35, balance: 10 },
//   { id: 22, category: "Snacks", item: "Popcorn", produced: 80, sold: 60, balance: 20 },
// ]

// const ResInventory = () => {
//   const [selectedCategory, setSelectedCategory] = useState("All")
//   const [filterDate, setFilterDate] = useState("today")
//   const [startDate, setStartDate] = useState("")
//   const [endDate, setEndDate] = useState("")
//   const [searchTerm, setSearchTerm] = useState("")
//   const [inventory, setInventory] = useState(initialInventory)

//   const handleEdit = (itemId) => {
//     const item = inventory.find((inv) => inv.id === itemId)
//     if (item) {
//       const newQuantity = prompt(`Edit produced quantity for ${item.item}:`, item.produced)
//       if (newQuantity && !isNaN(newQuantity)) {
//         setInventory((prev) =>
//           prev.map((inv) =>
//             inv.id === itemId
//               ? { ...inv, produced: Number.parseInt(newQuantity), balance: Number.parseInt(newQuantity) - inv.sold }
//               : inv,
//           ),
//         )
//       }
//     }
//   }

//   const handleDelete = (itemId) => {
//     const item = inventory.find((inv) => inv.id === itemId)
//     if (item && confirm(`Are you sure you want to delete ${item.item}?`)) {
//       setInventory((prev) => prev.filter((inv) => inv.id !== itemId))
//     }
//   }

//   // Filter inventory based on category, date, and search
//   const filteredInventory = inventory.filter((item) => {
//     const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
//     const matchesSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase())
//     return matchesCategory && matchesSearch
//   })

//   const handleDateFilter = (value) => {
//     setFilterDate(value)
//     const today = new Date()
//     if (value === "yesterday") {
//       const yesterday = new Date(today)
//       yesterday.setDate(yesterday.getDate() - 1)
//       setStartDate(formatDate(yesterday))
//       setEndDate(formatDate(yesterday))
//     } else if (value === "today") {
//       setStartDate(formatDate(today))
//       setEndDate(formatDate(today))
//     } else if (value === "tomorrow") {
//       const tomorrow = new Date(today)
//       tomorrow.setDate(tomorrow.getDate() + 1)
//       setStartDate(formatDate(tomorrow))
//       setEndDate(formatDate(tomorrow))
//     } else {
//       setStartDate("")
//       setEndDate("")
//     }
//   }

//   const getStockStatus = (balance, produced) => {
//     const percentage = (balance / produced) * 100
//     if (percentage <= 10) return { label: "Low Stock", variant: "destructive" }
//     if (percentage <= 30) return { label: "Medium", variant: "secondary" }
//     return { label: "In Stock", variant: "default" }
//   }

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
    
//       <div className="flex-1 p-6 ml-64">
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-purple-800 mb-4">Menu Inventory Dashboard</h1>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <Card className="bg-gradient-to-r from-purple-500 to-[#5c1e15] text-white">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-purple-100">Total Items</p>
//                     <p className="text-2xl font-bold">{inventory.length}</p>
//                   </div>
//                   <span className="text-3xl">📦</span>
//                 </div>
//               </CardContent>
//             </Card>
//             <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-indigo-100">Total Produced</p>
//                     <p className="text-2xl font-bold">{inventory.reduce((sum, item) => sum + item.produced, 0)}</p>
//                   </div>
//                   <span className="text-3xl">📈</span>
//                 </div>
//               </CardContent>
//             </Card>
//             <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-amber-100">Low Stock Items</p>
//                     <p className="text-2xl font-bold">
//                       {inventory.filter((item) => (item.balance / item.produced) * 100 <= 10).length}
//                     </p>
//                   </div>
//                   <span className="text-3xl">⚠️</span>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
//           <CardHeader className="bg-gradient-to-r from-[#69231B] to-indigo-600 text-white rounded-t-lg">
//             <CardTitle className="text-2xl font-bold flex items-center gap-2">
//               <span className="text-2xl">📦</span>
//               Inventory Management
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-6">
//             <div className="flex flex-col lg:flex-row gap-4 mb-6">
//               {/* Category Dropdown */}
//               <Select value={selectedCategory} onValueChange={setSelectedCategory}>
//                 <SelectTrigger className="w-full lg:w-48 border-purple-200 focus:ring-purple-500 bg-white">
//                   <SelectValue placeholder="Select Category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="All">All Categories</SelectItem>
//                   {categories.map((category) => (
//                     <SelectItem key={category} value={category}>
//                       {category}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               <div className="flex gap-2 items-center">
//                 <span className="text-sm font-medium text-purple-700 whitespace-nowrap">Date Range:</span>
//                 <Input
//                   type="date"
//                   value={startDate}
//                   onChange={(e) => setStartDate(e.target.value)}
//                   className="w-40 border-purple-200 focus:ring-purple-500 bg-white"
//                   placeholder="From"
//                 />
//                 <span className="text-purple-400">to</span>
//                 <Input
//                   type="date"
//                   value={endDate}
//                   onChange={(e) => setEndDate(e.target.value)}
//                   className="w-40 border-purple-200 focus:ring-purple-500 bg-white"
//                   placeholder="To"
//                 />
//                 <div className="flex gap-1 ml-2">
//                   <Button
//                     variant={filterDate === "yesterday" ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => handleDateFilter("yesterday")}
//                     className={`text-xs px-3 py-1 ${
//                       filterDate === "yesterday"
//                         ? "bg-[#69231B] text-white"
//                         : "text-purple-600 border-purple-200 hover:bg-purple-50"
//                     }`}
//                   >
//                     Yesterday
//                   </Button>
//                   <Button
//                     variant={filterDate === "today" ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => handleDateFilter("today")}
//                     className={`text-xs px-3 py-1 ${
//                       filterDate === "today"
//                         ? "bg-[#69231B] text-white"
//                         : "text-purple-600 border-purple-200 hover:bg-purple-50"
//                     }`}
//                   >
//                     Today
//                   </Button>
//                   <Button
//                     variant={filterDate === "tomorrow" ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => handleDateFilter("tomorrow")}
//                     className={`text-xs px-3 py-1 ${
//                       filterDate === "tomorrow"
//                         ? "bg-[#69231B] text-white"
//                         : "text-purple-600 border-purple-200 hover:bg-purple-50"
//                     }`}
//                   >
//                     Tomorrow
//                   </Button>
//                 </div>
//               </div>

//               <div className="relative flex-1 max-w-xs">
//                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">🔍</span>
//                 <Input
//                   type="text"
//                   placeholder="Search items..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-9 pr-4 py-2 text-sm border-purple-200 focus:ring-purple-500 bg-white"
//                 />
//               </div>
//             </div>

//             <div className="rounded-lg border border-purple-100 overflow-hidden">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="bg-gradient-to-r from-purple-50 to-indigo-50">
//                     <TableHead className="text-purple-700 font-semibold">Category</TableHead>
//                     <TableHead className="text-purple-700 font-semibold">Item</TableHead>
//                     <TableHead className="text-purple-700 font-semibold">Produced</TableHead>
//                     <TableHead className="text-purple-700 font-semibold">Sold</TableHead>
//                     <TableHead className="text-purple-700 font-semibold">Balance</TableHead>
//                     <TableHead className="text-purple-700 font-semibold">Status</TableHead>
//                     <TableHead className="text-purple-700 font-semibold">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredInventory.map((item, index) => {
//                     const stockStatus = getStockStatus(item.balance, item.produced)
//                     return (
//                       <TableRow
//                         key={item.id}
//                         className={`hover:bg-purple-50/50 transition-colors ${
//                           index % 2 === 0 ? "bg-white" : "bg-purple-25/25"
//                         }`}
//                       >
//                         <TableCell className="font-medium">
//                           <Badge variant="outline" className="text-purple-600 border-purple-200">
//                             {item.category}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="font-medium text-gray-900">{item.item}</TableCell>
//                         <TableCell className="text-green-600 font-semibold">{item.produced}</TableCell>
//                         <TableCell className="text-blue-600 font-semibold">{item.sold}</TableCell>
//                         <TableCell className="text-purple-600 font-semibold">{item.balance}</TableCell>
//                         <TableCell>
//                           <Badge variant={stockStatus.variant} className="text-xs">
//                             {stockStatus.label}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex gap-2">
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => handleEdit(item.id)}
//                               className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-colors"
//                             >
//                               ✏️
//                             </Button>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => handleDelete(item.id)}
//                               className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
//                             >
//                               🗑️
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     )
//                   })}
//                 </TableBody>
//               </Table>
//             </div>

//             {filteredInventory.length === 0 && (
//               <div className="text-center py-8 text-gray-500">
//                 <span className="text-6xl block mb-4">📦</span>
//                 <p>No items found matching your criteria.</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

// export default ResInventory

import React from 'react'

const ResInventory = () => {
  return (
    <div>
      <h1>ResInventory</h1>
    </div>
  )
}

export default ResInventory
