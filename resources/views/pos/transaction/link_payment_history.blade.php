@extends('master')
@section('title', '| Link Payment History')
@section('admin')

    <div class="row">
        {{--
        <div class="col-md-12 grid-margin stretch-card">
            <div class="card ">
                <div class="card-body">
                    <div class="col-md-12 grid-margin stretch-card d-flex  mb-0 justify-content-between">
                        <div>
                            <h4 class="mb-2">View Link Payment History</h4>
                        </div>
                        <div class="">
                            <h4 class="text-right"><a href="{{ route('service.sale') }}" class="btn"
                                    style="background: #5660D9">Add Link Payment History</a></h4>
                        </div>
                    </div>
                </div>
            </div>
        </div> --}}

        <div class="col-md-12 grid-margin stretch-card">
            <div class="card">
                <div class="card-body">
                    <h4 class="mb-2">Link Payment History</h4>
                    <div id="" class="table-responsive">
                        <table id="example" class="table">
                            <thead>
                                <tr>
                                    <th>Sale Invoice No</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Inv Type</th>
                                    <th>Link Amount</th>
                                    <th>Link By</th>

                                </tr>
                            </thead>
                            <tbody class="showData">
                                @if ($allLinkPayments->count() > 0)
                                    @foreach ($allLinkPayments as $key => $allLinkPayment)
                                        <tr>
                                            <td> <a
                                                    href="{{ url('/sale/invoice/' . $allLinkPayment->saleInv->id) }}">{{ $allLinkPayment->inv_number ?? 'N/A' }}</a>
                                            </td>
                                            <td>{{ $allLinkPayment->customer->name ?? 'N/A' }}</td>
                                            <td>
                                                @if ($allLinkPayment->created_at)
                                                    {{ \Carbon\Carbon::parse($allLinkPayment->created_at)->timezone('Asia/Dhaka')->format('d F Y, h:i A') }}
                                                @else
                                                    {{ '' }}
                                                @endif
                                            </td>
                                            <td>{{ $allLinkPayment->inv_type ?? 'N/A' }}</td>
                                            <td>{{ $allLinkPayment->link_amount ?? 0 }}</td>
                                            <td>{{ $allLinkPayment->user->name ?? 'N/A' }}</td>



                                        </tr>
                                    @endforeach
                                @else
                                    <tr>
                                        <td colspan="12">
                                            <div class="text-center text-warning mb-2">Data Not Found</div>
                                            {{-- <div class="text-center">
                                                <a href="{{ route('service.sale') }}" class="btn btn-primary">Add Link
                                                    Payment History<i data-feather="plus"></i></a>
                                            </div> --}}
                                        </td>
                                    </tr>
                                @endif

                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    </div>

@endsection
