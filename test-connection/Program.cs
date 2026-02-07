using Npgsql;

var connStr = "Host=aws-0-us-west-2.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.inigceuznvargaxndqts;Password=FincurioDb2026x;SSL Mode=Require;Trust Server Certificate=true;No Reset On Close=true;Pooling=false;Timeout=15";

Console.WriteLine("--- Test 1: SELECT ---");
try
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = conn.CreateCommand();
    cmd.CommandText = "SELECT count(*) FROM categories";
    var result = await cmd.ExecuteScalarAsync();
    Console.WriteLine($"SELECT SUCCESS: {result}");
}
catch (Exception ex)
{
    Console.WriteLine($"SELECT FAILED: {ex.GetType().Name}: {ex.Message}");
}

Console.WriteLine("\n--- Test 2: INSERT with RETURNING ---");
try
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = conn.CreateCommand();
    var testId = Guid.NewGuid();
    cmd.CommandText = $"INSERT INTO categories (id, name, display_name, type, icon, color, sort_order, created_at) VALUES ('{testId}', 'TestCat', 'Test Category', 'expense', 'test', '#000000', 99, NOW()) RETURNING id";
    var result = await cmd.ExecuteScalarAsync();
    Console.WriteLine($"INSERT+RETURNING SUCCESS: {result}");

    // Clean up
    cmd.CommandText = $"DELETE FROM categories WHERE id = '{testId}'";
    await cmd.ExecuteNonQueryAsync();
    Console.WriteLine("Cleanup done");
}
catch (Exception ex)
{
    Console.WriteLine($"INSERT+RETURNING FAILED: {ex.GetType().Name}: {ex.Message}");
}

Console.WriteLine("\n--- Test 3: INSERT without RETURNING ---");
try
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = conn.CreateCommand();
    var testId = Guid.NewGuid();
    cmd.CommandText = $"INSERT INTO categories (id, name, display_name, type, icon, color, sort_order, created_at) VALUES ('{testId}', 'TestCat2', 'Test Category 2', 'expense', 'test', '#000000', 98, NOW())";
    var rows = await cmd.ExecuteNonQueryAsync();
    Console.WriteLine($"INSERT SUCCESS: {rows} rows affected");

    // Clean up
    cmd.CommandText = $"DELETE FROM categories WHERE id = '{testId}'";
    await cmd.ExecuteNonQueryAsync();
    Console.WriteLine("Cleanup done");
}
catch (Exception ex)
{
    Console.WriteLine($"INSERT FAILED: {ex.GetType().Name}: {ex.Message}");
}

Console.WriteLine("\nDone.");
