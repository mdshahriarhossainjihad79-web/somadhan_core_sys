@extends('master')
@section('title', '| Warehouse Settings Page')
@section('admin')
    <h2 style="margin: 20px">Warehouse Settings</h2>
    <div class="row">
        <div class="col-md-12 stretch-card">
            <div class="card">
                <div class="card-body">
                    <form id="myValidForm" action="{{ route('warehouse.setting.update') }}" method="post">
                        @csrf
                        <input type="hidden" name="setting_id" value="{{ $warehouseSetting->id }}">
                        <!-- Row -->
                        <div class="row">
                            <h6 class="card-title text-info">Warehouse Settings</h6><br><br>
                            <div class="col-sm-6">
                                <div class="mb-3 form-valid-groups">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox"
                                            {{ $warehouseSetting->warehouse_manage == 1 ? 'checked' : '' }}
                                            name="warehouse_manage" role="switch" id="flexSwitchCheckDefault125">
                                        <label class="form-check-label" for="flexSwitchCheckDefault125">Warehouse
                                            Manage</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <input type="submit" class="btn btn-primary submit" value="Save Changes">
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>



@endsection
