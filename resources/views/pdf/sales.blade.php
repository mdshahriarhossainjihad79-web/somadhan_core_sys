<!DOCTYPE html>
<html>

<head>
    <title>Sales Report</title>
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }
    </style>
</head>

<body>
    <h2>Sales Report</h2>
    <table>
        <thead>
            <tr>
                <th>SL No</th>
                <th>Invoice Number</th>
                <th>Customer</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Total</th>
                <th>Discount</th>
                <th>Receivable</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Purchase Cost</th>
                <th>Profit</th>
                <th>Receive Account</th>
                <th>Sale By</th>
                <th>Status</th>
                <th>Sale Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($sales as $index => $sale)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $sale->invoice_number }}</td>
                    <td>{{ $sale->customer ? $sale->customer->name : 'N/A' }}</td>
                    <td>{{ $sale->quantity }}</td>
                    <td>{{ $sale->sale_date }}</td>
                    <td>{{ $sale->total }}</td>
                    <td>{{ $sale->discount }}</td>
                    <td>{{ $sale->receivable }}</td>
                    <td>{{ $sale->paid }}</td>
                    <td>{{ $sale->due }}</td>
                    <td>{{ $sale->total_purchase_cost }}</td>
                    <td>{{ $sale->profit }}</td>
                    <td>{{ $sale->accountReceive ? $sale->accountReceive->name : 'N/A' }}</td>
                    <td>{{ $sale->saleBy ? $sale->saleBy->name : 'N/A' }}</td>
                    <td>{{ $sale->status }}</td>
                    <td>{{ $sale->order_status }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>
