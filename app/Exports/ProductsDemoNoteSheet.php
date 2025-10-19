namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;

class ProductsDemoNoteSheet implements FromArray, WithTitle
{
    public function array(): array
    {
        return [
            ['Field', 'Note'],
            ['name', 'Product name (required)'],
            ['category', 'Must match existing or will be created'],
            ['brand', 'Must match existing or will be created'],
            ['unit', 'piece, kg, litre etc. (required)'],
            ['cost_price', 'Required'],
            ['b2b_price', 'Optional'],
            ['b2c_price', 'Optional'],
            ['size', 'Required for variations'],
            ['color', 'Optional'],
            ['branch_id', 'Your branch ID (required)'],
        ];
    }

    public function title(): string
    {
        return 'Field Notes';
    }
}
