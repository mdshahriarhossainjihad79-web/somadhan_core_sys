@extends('master')
@section('title', '| Add Promotional Details')
@section('admin')
    <div class="row">
        <div class="col-md-12 grid-margin stretch-card d-flex justify-content-end">
            <div class="">

                <h4 class="text-right"><a href="{{ route('promotion.details.view') }}" class="btn btn-primary">View Promotion
                        Details</a></h4>
            </div>
        </div>
        <div class="col-md-12 stretch-card">
            <div class="card">
                <div class="card-body">
                    <h6 class="card-title text-info">Add Promotion Details</h6>
                    <form>
                        <div class="row">
                            <!-- Col -->
                            <div class="col-sm-6">
                                <div class="mb-3 form-valid-groups">
                                    <label class="form-label">Promotion<span class="text-danger">*</span></label>
                                    <select class="form-select js-example-basic-single promotion_id" name="promotion_id"
                                        aria-invalid="false" onclick="errorRemove(this);">
                                        <option selected="" disabled="">Select Promotion</option>
                                        @foreach ($promotions as $promotion)
                                            <option value="{{ $promotion->id }}">{{ $promotion->promotion_name }}</option>
                                        @endforeach
                                    </select>
                                    <span class="text-danger promotion_id_error"></span>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="mb-3 form-valid-groups">
                                    <label class="form-label">Promotion Type<span class="text-danger">*</span></label>
                                    <select class="form-select js-example-basic-single promotion_type" name="promotion_type"
                                        aria-invalid="false">
                                        <option selected="" disabled="">Select Promotion Type</option>
                                        <option value="wholesale">Wholesale</option>
                                        <option value="products">Products</option>
                                        <option value="customers">Customer</option>
                                        <option value="branch">Branch</option>
                                        <option value="category">Category</option>
                                        <option value="brand">Brand</option>
                                    </select>
                                    <span class="text-danger promotion_type_error"></span>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="mb-3 form-valid-groups">
                                    <label class="form-label">Additional Conditions</label>
                                    <input type="number" name="additional_conditions"
                                        class="form-control field_required additional_conditions"
                                        placeholder="Enter Addional Condition">
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="mb-3 form-valid-groups logic_field">
                                    {{-- <label class="form-label">Logic<span class="text-danger">*</span></label> --}}
                                </div>
                            </div>

                        </div><!-- Row -->
                        <div>
                            <input type="submit" class="btn btn-primary submit save_promotion_details" value="Save">
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <script>
        let priceType = "{{ $sale_price_type }}";
        // error remove
        function errorRemove(element) {
            if (element.value != '') {
                $(element).siblings('span').hide();
                $(element).css('border-color', 'green');
            }
        }


        $(document).ready(function() {
            // show error
            function showError(name, message) {
                $(name).css('border-color', 'red');
                $(name).focus();
                $(`${name}_error`).show().text(message);
            }


            $(document).on('change', '.promotion_type', function() {
                let type = $(this).val();

                $.ajax({
                    url: "/promotion/details/find",
                    type: 'GET',
                    data: {
                        type: type
                    },
                    success: function(res) {
                        if (res.status == 200) {
                            let wholesale = res.wholesale;
                            let products = res.products;
                            let customers = res.customers;
                            let branch = res.branch;
                            let categories = res.categories;
                            let brands = res.brands;
                            if (wholesale) {
                                $('.logic_field').html('');
                            } else if (products) {
                                let productHTML = `
                                    <div class="col-md-12">
                                        <div class="table-responsive">
                                            <table id="dataTableExample" class="table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Product Name</th>
                                                        <th>Stock</th>
                                                        <th>Size</th>
                                                        <th>Color</th>
                                                        <th>Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>`;
                                products.forEach(product => {
                                    productHTML += `
                                        <tr>
                                            <td>
                                                <input type="checkbox" class="form-check-input" name="check">
                                                <input type="hidden" value="${product.id}">
                                            </td>
                                            <td>${product?.product?.name ?? 'N/A'}</td>
                                            <td>
                                                ${product.stocks.reduce((sum, stock) => sum + stock.stock_quantity, 0)}
                                            </td>
                                            <td>${product?.variation_size?.size ?? 'N/A'}</td>
                                            <td>${product?.color_name?.name ?? 'N/A'}</td>
                                            <td>${priceType === 'b2b_price' ? product?.b2b_price :  product?.b2c_price}</td>
                                        </tr>`;
                                });
                                productHTML += `
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>`;
                                $('.logic_field').html(productHTML);

                                // Initialize DataTable with custom search
                                let productTable = $('#dataTableExample').DataTable({
                                    pageLength: 10,
                                    lengthChange: false
                                });


                            } else if (customers) {
                                let customerHTML = `
                                    <div class="col-md-12">
                                        <div class="table-responsive">
                                            <table id="dataTableExample" class="table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Customer Name</th>
                                                        <th>Purchase Cost</th>
                                                    </tr>
                                                </thead>
                                                <tbody>`;
                                customers.forEach(customer => {
                                    customerHTML += `
                                        <tr>
                                            <td>
                                                <input type="checkbox" class="form-check-input" name="check">
                                                <input type="hidden" value="${customer.id}">
                                            </td>
                                            <td>${customer.name}</td>
                                            <td>${customer.total_receivable}</td>
                                        </tr>`;
                                });
                                customerHTML += `
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>`;
                                $('.logic_field').html(customerHTML);

                                // Initialize DataTable with custom search
                                let customerTable = $('#dataTableExample').DataTable({
                                    pageLength: 10,
                                    lengthChange: false
                                });

                            } else if (branch) {
                                let productHTML = `
                                    <div class="col-md-12">
                                        <div class="table-responsive">
                                            <table id="dataTableExample" class="table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Branch Name</th>
                                                        <th>Address</th>
                                                    </tr>
                                                </thead>
                                                <tbody>`;
                                branch.forEach(element => {
                                    productHTML += `
                                        <tr>
                                            <td>
                                                <input type="checkbox" class="form-check-input" name="check">
                                                <input type="hidden" value="${element.id}">
                                            </td>
                                            <td>${element.name}</td>
                                            <td>${element.address}</td>
                                        </tr>`;
                                });
                                productHTML += `
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>`;
                                $('.logic_field').html(productHTML);

                                // Initialize DataTable
                                $('#dataTableExample').DataTable({
                                    pageLength: 10,
                                    lengthChange: false
                                });

                            } else if (categories) {
                                let categoryHTML = `
                                        <div class="col-md-12">
                                            <div class="table-responsive">
                                                <table id="dataTableExample" class="table">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Category</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>`;
                                categories.forEach(category => {
                                    categoryHTML += `
                                            <tr>
                                                <td>
                                                    <input type="checkbox" class="form-check-input" name="check">
                                                    <input type="hidden" value="${category.id}">
                                                </td>
                                                <td>${category.name}</td>
                                            </tr>`;
                                });
                                categoryHTML += `
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>`;
                                $('.logic_field').html(categoryHTML);

                                // Initialize DataTable with custom search
                                let categoryTable = $('#dataTableExample').DataTable({
                                    pageLength: 10,
                                    lengthChange: false
                                });
                            } else if (brands) {
                                let brandHTML = `
                                        <div class="col-md-12">
                                            <div class="table-responsive">
                                                <table id="dataTableExample" class="table">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Category</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>`;
                                brands.forEach(brand => {
                                    brandHTML += `
                                            <tr>
                                                <td>
                                                    <input type="checkbox" class="form-check-input" name="check">
                                                    <input type="hidden" value="${brand.id}">
                                                </td>
                                                <td>${brand.name}</td>
                                            </tr>`;
                                });
                                brandHTML += `
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>`;
                                $('.logic_field').html(brandHTML);

                                // Initialize DataTable with custom search
                                let brandTable = $('#dataTableExample').DataTable({
                                    pageLength: 10,
                                    lengthChange: false
                                });
                            } else {
                                toastr.warning('data not found');
                            }
                        } else {
                            toastr.warning(res.message);
                        }
                    }
                });
            });

            let ids = [];
            // Output the updated array to console

            $(document).on('change', 'input[name="check"]', function() {
                ids = []; // Reset the array
                $('input[name="check"]:checked').each(function() {
                    var id = $(this).siblings('input[type="hidden"]').val();
                    ids.push(id);
                });
                // console.log(ids);

            });
            // console.log(ids);

            $(document).on('click', '.save_promotion_details', function(e) {
                e.preventDefault();

                let promotion_id = $('.promotion_id').val();
                let promotion_type = $('.promotion_type').val();
                let additional_conditions = $('.additional_conditions').val();
                let logic;

                if (promotion_type == 'wholesale') {
                    logic = "all";
                } else {
                    logic = ids.join();
                }

                $.ajaxSetup({
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    }
                });

                $.ajax({
                    url: '/promotion/details/store',
                    type: 'POST',
                    data: {
                        promotion_id,
                        promotion_type,
                        additional_conditions,
                        logic
                    },
                    success: function(res) {
                        // console.log(res);
                        if (res.status == 200) {
                            window.location.href = "{{ route('promotion.details.view') }}";
                            toastr.success(res.message);
                        } else {
                            // console.log(res.errors);
                            if (res.errors.promotion_id) {
                                showError('.promotion_id', res.errors.promotion_id);
                            }
                            if (res.errors.promotion_type) {
                                showError('.promotion_type', res.errors.promotion_type);
                            }
                        }
                    }
                });
            });
        });
    </script>
@endsection
