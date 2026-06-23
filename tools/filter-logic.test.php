<?php
// Pretvaramo se da smo u WP-u da ABSPATH-guard u filters.php ne prekine učitavanje.
define('ABSPATH', __DIR__);
require __DIR__ . '/../wp-theme/vinoteka15/inc/filters.php';

function eq($got, $exp, $msg) {
    if ($got !== $exp) {
        fwrite(STDERR, "FAIL: $msg\n  got: " . var_export($got, true) . "\n  exp: " . var_export($exp, true) . "\n");
        exit(1);
    }
}

// v15_csv_toggle: dodaje/izbacuje slug iz zarezom-razdvojene liste
eq(v15_csv_toggle('', 'srbija'), 'srbija', 'add to empty');
eq(v15_csv_toggle('srbija', 'srbija'), '', 'remove only');
eq(v15_csv_toggle('srbija,hrvatska', 'srbija'), 'hrvatska', 'remove first');
eq(v15_csv_toggle('hrvatska', 'srbija'), 'hrvatska,srbija', 'append');
eq(v15_csv_toggle('srbija, hrvatska', 'italija'), 'srbija,hrvatska,italija', 'trim + append');
eq(v15_csv_toggle('srbija,,hrvatska', 'srbija'), 'hrvatska', 'drop empty segments');

// v15_price_params: bucket -> WC price args
eq(v15_price_params('do-1500'), ['max_price' => '1500'], 'bucket do-1500');
eq(v15_price_params('1500-3000'), ['min_price' => '1500', 'max_price' => '3000'], 'bucket 1500-3000');
eq(v15_price_params('3000+'), ['min_price' => '3000'], 'bucket 3000+');
eq(v15_price_params('all'), [], 'bucket all -> none');

echo "SVE OK\n";
