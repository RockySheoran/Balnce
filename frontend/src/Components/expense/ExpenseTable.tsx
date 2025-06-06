/** @format */
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/Components/ui/pagination";
import { useAppDispatch, useAppSelector } from "@/lib/Redux/store/hooks";
import {
  setCurrentPage,
  deleteExpense,
  updateExpense,
} from "@/lib/Redux/features/expense/expenseSlice";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { toast } from "sonner";
import { DeleteTransAction } from "@/Actions/transactionActions/DeleteTransAction";
import { deleteTransaction } from "@/lib/Redux/features/transactions/transactionsSlice";
import { updateAccount } from "@/lib/Redux/features/account/accountSlice";
import { EditExpenseDialog } from "./EditExpenseDialog";
import { updateTransaction } from "@/lib/Redux/features/transactions/transactionsSlice";

const COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Teal
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#8884D8", // Purple
  "#82CA9D", // Green
];

const ExpenseTable: React.FC = memo(() => {
  const dispatch = useAppDispatch();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<any>(null);
  const { token } = useAppSelector((state) => state.user);
    const[deletePending,setDeletePending] = useState(false)
  
  const { allAccounts, selectedAccount } = useAppSelector(
    (state) => state.account
  );

  // Memoized selector to prevent unnecessary re-renders
  const { expenses, filteredExpenses, currentPage, itemsPerPage } =
    useAppSelector(
      useCallback(
        (state) => ({
          expenses: state.expenses.expenses,
          filteredExpenses: state.expenses.filteredExpenses,
          currentPage: state.expenses.filterState.currentPage,
          itemsPerPage: state.expenses.filterState.itemsPerPage,
        }),
        []
      )
    );

  // Memoized derived data
  const categories = useMemo(
    () => Array.from(new Set(expenses.map((e) => e.category))),
    [expenses]
  );

  const safeFilteredExpenses = useMemo(
    () => (filteredExpenses.length > 0 ? filteredExpenses : expenses),
    [filteredExpenses, expenses]
  );

  const totalPages = useMemo(
    () => Math.ceil(safeFilteredExpenses.length / itemsPerPage),
    [safeFilteredExpenses.length, itemsPerPage]
  );

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return safeFilteredExpenses.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, itemsPerPage, safeFilteredExpenses]);

  // Reset to page 1 if current page exceeds total pages
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      dispatch(setCurrentPage(1));
    }
  }, [currentPage, totalPages, dispatch]);

  // Memoized event handlers
  const handlePreviousPage = useCallback(() => {
    dispatch(setCurrentPage(Math.max(currentPage - 1, 1)));
  }, [currentPage, dispatch]);

  const handleNextPage = useCallback(() => {
    dispatch(setCurrentPage(Math.min(currentPage + 1, totalPages)));
  }, [currentPage, totalPages, dispatch]);

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
    },
    [dispatch]
  );

  const getCategoryColor = useCallback(
    (category: string) => {
      const colorIndex = categories.indexOf(category) % COLORS.length;
      return {
        bgColor: `${COLORS[colorIndex]}20`,
        textColor: COLORS[colorIndex],
      };
    },
    [categories]
  );

  const handleDeleteClick = useCallback((expenseId: string) => {
    setExpenseToDelete(expenseId);
    setDeleteDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((expense: any) => {
    setExpenseToEdit(expense);
  }, []);

  const handleEditClose = useCallback(() => {
    setExpenseToEdit(null);
  }, []);

  const handleEditSubmit = useCallback(
    async (updatedExpense: any) => {
      setExpenseToEdit(null);
    },
    [dispatch]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (expenseToDelete) {
      setDeletePending(true);
      // Call the delete action
      try {
        const data = await DeleteTransAction({
          id: expenseToDelete,
          token: token || "",
        });
        if (data.status == 200) {
          toast.success(data.message);
          dispatch(deleteExpense(expenseToDelete));
          dispatch(deleteTransaction(expenseToDelete));
          dispatch(updateAccount(data.data));
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Failed to delete expense");
      } finally {
        setDeleteDialogOpen(false);
        setExpenseToDelete(null);
        setDeletePending(false);
      }
    }
  }, [expenseToDelete, dispatch, token]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setExpenseToDelete(null);
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow overflow-hidden mb-8"
      >
        <div className="overflow-x-auto">
          <Table className="min-w-[700px] md:min-w-full">
            

            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="min-w-[150px]">Description</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((expense) => {
                  const { bgColor, textColor } = getCategoryColor(
                    expense.category
                  );
                  return (
                    <TableRow
                      key={expense.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium whitespace-nowrap">
                        {new Date(expense.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {expense.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {expense.type}
                      </TableCell>
                      <TableCell>
                        <span
                          className="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                          style={{
                            backgroundColor: bgColor,
                            color: textColor,
                          }}
                        >
                          {expense.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap">
                        ${expense.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-gray-500 truncate max-w-[200px]">
                        {expense.description || "-"}
                      </TableCell>
                      <TableCell className="text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-500 cursor-pointer hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEditClick(expense)}
                          aria-label={`Edit expense ${expense.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 cursor-pointer hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(expense.id)}
                          aria-label={`Delete expense ${expense.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {filteredExpenses.length === 0 && expenses.length > 0
                      ? "No expenses match your filters"
                      : "No expenses found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="">
          <div className="text-left p-4 bg-gray-50 sticky top-0 z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Expense Records
                </h2>
                <span className="text-sm text-gray-500">
                  Showing{" "}
                  {Math.min(
                    currentPage * itemsPerPage - itemsPerPage + 1,
                    safeFilteredExpenses.length
                  )}
                  -
                  {Math.min(
                    currentPage * itemsPerPage,
                    safeFilteredExpenses.length
                  )}{" "}
                  of {safeFilteredExpenses.length} expenses
                  {filteredExpenses.length !== expenses.length && " (filtered)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  {currentPage > 1 && (
                    <PaginationPrevious
                      onClick={handlePreviousPage}
                      aria-label="Previous page"
                    />
                  )}
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => handlePageChange(page)}
                        aria-label={`Page ${page}`}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  {currentPage < totalPages && (
                    <PaginationNext
                      onClick={handleNextPage}
                      aria-label="Next page"
                    />
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              expense record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              

              onClick={handleCancelDelete}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 cursor-pointer text-white hover:bg-red-700 focus-visible:ring-red-600"
             disabled={deletePending}
            >
              {deletePending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Expense Dialog */}
      {expenseToEdit && (
        <EditExpenseDialog
          expense={expenseToEdit}
          onClose={handleEditClose}
          onSubmit={handleEditSubmit}
          token={token || ""}
        />
      )}
    </>
  );
});

ExpenseTable.displayName = "ExpenseTable";
export default ExpenseTable;